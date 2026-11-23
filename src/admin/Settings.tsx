import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Setting {
  id: number;
  key: string;
  value: string;
  type: string;
  group: string;
  label: string;
  description: string | null;
}

interface ThemePreset {
  name: string;
  description: string;
  colors: { ink: string; gold: string; parchment: string; deepgold: string; warmgray: string; };
}

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [activeTab, setActiveTab] = useState<string>(''); 
  
  const token = localStorage.getItem('adminToken');
  const { refresh } = useSettings();

  const loadSettings = () => {
    axios.get(`${API_URL}/api/admin/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setSettings(res.data.data);
        if (!activeTab && res.data.data.length > 0) {
          setActiveTab(res.data.data[0].group);
        }
      })
      .catch((err) => {
        console.error(err);
        setMessageType('error');
        setMessage('Failed to load settings.');
      });
  };

  useEffect(() => {
    loadSettings();
  }, [token]);

  const groups = [...new Set(settings.map((s) => s.group))];

  const handleChange = (key: string, value: string) => {
    setEdited({ ...edited, [key]: value });
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await axios.put(`${API_URL}/api/admin/settings`, edited, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEdited({});
      setMessageType('success');
      const updated = res.data?.updated || Object.keys(edited).length;
      setMessage(`✓ Successfully updated ${updated} settings.`);
      loadSettings();
      await refresh();
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessageType('error');
      setMessage('✗ Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(edited).length > 0;

  const getValue = (setting: Setting): string => {
    return edited[setting.key] !== undefined ? edited[setting.key] : setting.value || '';
  };

  const applyPreset = (key: string, preset: ThemePreset) => {
    const updates: Record<string, string> = {
      'theme.preset': key,
      'theme.color.ink': preset.colors.ink,
      'theme.color.gold': preset.colors.gold,
      'theme.color.parchment': preset.colors.parchment,
      'theme.color.deepgold': preset.colors.deepgold,
      'theme.color.warmgray': preset.colors.warmgray,
    };
    setEdited({ ...edited, ...updates });
    const root = document.documentElement;
    Object.entries(preset.colors).forEach(([k, v]) => root.style.setProperty(`--color-${k}`, v));
  };

  // ✅ FIXED: Added "as Record<string, ThemePreset>" to fix the TS error
  const getPresets = (): Record<string, ThemePreset> | null => {
    try {
      const presetsSetting = settings.find((s) => s.key === 'theme.presets');
      if (!presetsSetting) return null;
      return JSON.parse(presetsSetting.value) as Record<string, ThemePreset>;
    } catch { return null; }
  };

  const currentPreset = edited['theme.preset'] ?? settings.find((s) => s.key === 'theme.preset')?.value ?? 'original';

  const renderFontSelector = (setting: Setting) => {
    const currentValue = getValue(setting);
    const availableSetting = settings.find((s) => s.key === 'font.available');
    let fonts: any[] = [];
    try { fonts = availableSetting ? JSON.parse(availableSetting.value) : []; } catch { fonts = []; }

    return (
      <div>
        <select
          value={currentValue}
          onChange={(e) => handleChange(setting.key, e.target.value)}
          className="w-full px-4 py-4 md:py-3 bg-gray-50 border border-gray-200 text-[#1b1710] focus:border-[#86691c] outline-none text-base md:text-sm rounded-lg transition-shadow"
        >
          {fonts.map((font: any) => (
            <option key={font.name} value={font.name}>{font.name} ({font.category})</option>
          ))}
        </select>
        <div className="mt-4 p-5 bg-[#f8f6f0] rounded-xl border border-[#1b1710]/10">
          <p className="text-[10px] text-[#86691c] uppercase tracking-wider font-bold mb-3">Live Font Preview</p>
          <p className="text-2xl text-[#1b1710]" style={{ fontFamily: currentValue }}>Move. Think. Recover.</p>
          <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: currentValue }}>The quick brown fox jumps over the lazy dog.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-32 w-full max-w-7xl mx-auto">
      
      {/* HEADER & SAVE BUTTON */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#1b1710]">Content Settings</h1>
          <p className="text-gray-500 text-sm mt-1 md:text-base">Manage your landing page copy, colors, and fonts.</p>
        </div>
        <button
          onClick={save}
          disabled={!hasChanges || saving}
          className={`w-full md:w-auto px-8 py-4 md:py-3 tracking-widest text-sm font-bold uppercase rounded-xl transition-all ${
            hasChanges && !saving
              ? 'bg-[#86691c] text-white hover:bg-[#6b5416] shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? 'SAVING...' : hasChanges ? `SAVE ${Object.keys(edited).length} CHANGES` : 'SAVE'}
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 text-sm rounded-xl shadow-sm border ${
          messageType === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>{message}</div>
      )}

      {/* TABS NAVIGATION (Scrollable on Mobile) */}
      <div className="flex overflow-x-auto border-b border-[#1b1710]/10 mb-6 md:mb-8 pb-2 gap-2 custom-scrollbar snap-x">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setActiveTab(group)}
            className={`snap-start px-5 py-3 md:px-6 md:py-3 text-sm font-semibold tracking-wider capitalize whitespace-nowrap rounded-t-xl transition-colors ${
              activeTab === group
                ? 'bg-white text-[#86691c] border-b-2 border-[#86691c] shadow-sm'
                : 'text-gray-500 hover:text-[#1b1710] hover:bg-white/50'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* ACTIVE TAB CONTENT */}
      {groups.map((group) => {
        if (group !== activeTab) return null;

        const groupSettings = settings.filter((s) => s.group === group);

        return (
          <div key={group} className="bg-white p-4 sm:p-6 md:p-10 rounded-2xl shadow-sm border border-[#1b1710]/10 animate-fade-in-up">
            <h2 className="text-xl md:text-2xl font-serif text-[#1b1710] mb-6 md:mb-8 capitalize border-b border-gray-100 pb-4">
              {group} Settings
            </h2>

            {/* THEME PRESETS */}
            {group === 'theme' && (
              <div className="bg-[#f8f6f0] p-4 md:p-6 rounded-xl mb-8 border border-[#1b1710]/5">
                <p className="text-xs font-bold text-[#86691c] uppercase tracking-wider mb-4">Select a Theme Preset</p>
                {(() => {
                  const presets = getPresets();
                  if (!presets) return <p className="text-sm text-gray-500">No presets loaded.</p>;
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* ✅ Type annotation ensures TS knows 'preset' is a ThemePreset */}
                      {Object.entries(presets).map(([key, preset]: [string, ThemePreset]) => {
                        const isActive = currentPreset === key;
                        return (
                          <button
                            key={key}
                            onClick={() => applyPreset(key, preset)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              isActive ? 'border-[#86691c] bg-white shadow-md' : 'border-transparent bg-white/60 hover:bg-white hover:shadow-sm'
                            }`}
                          >
                            <div className="flex gap-2 mb-3">
                              {Object.values(preset.colors).map((c, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                            <p className="text-sm font-bold text-[#1b1710]">{preset.name}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{preset.description}</p>
                            {isActive && <p className="text-[10px] text-[#86691c] font-bold mt-2 uppercase tracking-wider">✓ Active</p>}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SETTINGS FIELDS */}
            <div className="grid gap-6 md:gap-8">
              {groupSettings
                .filter((s) => s.key !== 'theme.presets' && s.key !== 'font.available')
                .map((setting) => {
                  const currentValue = getValue(setting);
                  const isChanged = edited[setting.key] !== undefined;

                  return (
                    <div key={setting.key} className="group">
                      <label className="block text-xs font-bold text-[#1b1710] tracking-widest uppercase mb-2 flex flex-wrap items-center gap-2">
                        {setting.label || setting.key}
                        {isChanged && <span className="bg-[#86691c] text-white text-[9px] px-2 py-0.5 rounded-full">Unsaved</span>}
                      </label>

                      {setting.description && <p className="text-xs text-gray-500 mb-3">{setting.description}</p>}

                      {setting.key === 'font.heading' || setting.key === 'font.body' ? (
                        renderFontSelector(setting)
                      ) : setting.type === 'color' ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <input type="color" value={currentValue || '#000000'} onChange={(e) => handleChange(setting.key, e.target.value)} className="w-16 h-16 sm:w-14 sm:h-14 cursor-pointer border-0 rounded-lg shadow-sm" />
                          <input type="text" value={currentValue} onChange={(e) => handleChange(setting.key, e.target.value)} className="w-full flex-1 px-4 py-4 md:py-3 bg-gray-50 border border-gray-200 text-[#1b1710] focus:border-[#86691c] outline-none text-base md:text-sm rounded-lg font-mono" />
                        </div>
                      ) : setting.type === 'textarea' ? (
                        <textarea value={currentValue} onChange={(e) => handleChange(setting.key, e.target.value)} rows={3} className="w-full px-4 py-4 md:py-3 bg-gray-50 border border-gray-200 text-[#1b1710] focus:border-[#86691c] focus:ring-1 focus:ring-[#86691c] outline-none text-base md:text-sm rounded-lg transition-shadow" />
                      ) : setting.type === 'number' ? (
                        <input type="number" value={currentValue} onChange={(e) => handleChange(setting.key, e.target.value)} className="w-full px-4 py-4 md:py-3 bg-gray-50 border border-gray-200 text-[#1b1710] focus:border-[#86691c] outline-none text-base md:text-sm rounded-lg" />
                      ) : setting.type === 'boolean' ? (
                        <label className="flex items-center gap-4 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-gray-50">
                          <div onClick={() => handleChange(setting.key, currentValue === 'true' ? 'false' : 'true')} className={`relative w-14 h-7 rounded-full transition-colors ${currentValue === 'true' ? 'bg-[#86691c]' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${currentValue === 'true' ? 'translate-x-8' : 'translate-x-1'}`} />
                          </div>
                          <span className="text-sm font-medium text-[#1b1710]">{currentValue === 'true' ? 'Enabled / Visible' : 'Disabled / Hidden'}</span>
                        </label>
                      ) : setting.type === 'json' ? (
                        <textarea value={currentValue} onChange={(e) => handleChange(setting.key, e.target.value)} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-[#1b1710] focus:border-[#86691c] outline-none text-xs font-mono rounded-lg" />
                      ) : (
                        <input type="text" value={currentValue} onChange={(e) => handleChange(setting.key, e.target.value)} className="w-full px-4 py-4 md:py-3 bg-gray-50 border border-gray-200 text-[#1b1710] focus:border-[#86691c] focus:ring-1 focus:ring-[#86691c] outline-none text-base md:text-sm rounded-lg transition-shadow" />
                      )}
                      
                      <p className="text-[10px] text-gray-400 mt-2 font-mono">{setting.key}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}

      {/* FLOATING SAVE BAR */}
      {hasChanges && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 bg-[#1b1710] text-white shadow-2xl rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up border border-[#86691c]/30">
          <p className="text-sm font-medium w-full md:w-auto text-center md:text-left">
            <span className="text-[#86691c] font-bold">{Object.keys(edited).length}</span> unsaved changes
          </p>
          <button onClick={save} disabled={saving} className="w-full md:w-auto bg-[#86691c] text-white px-6 py-3 rounded-xl text-xs font-bold tracking-widest hover:bg-[#6b5416] transition-colors uppercase">
            {saving ? 'Saving...' : 'Save Now'}
          </button>
        </div>
      )}
    </div>
  );
}