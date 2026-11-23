import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/admin/analytics?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(console.error);
  }, [days, token]);

  if (loading || !data) return <div className="p-8 text-gray-500">Loading analytics...</div>;

  const { totals, perPost, commentStats, recentComments, referrers } = data;

  // Calculate total comments from stats
  const totalComments = commentStats?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
  const pendingComments = commentStats?.find((s: any) => s.status === 'pending')?.count || 0;

  return (
    <div className="pb-12">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Analytics</h1>
          <p className="text-gray-600 text-sm mt-1">Track your post performance and audience</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-900 outline-none focus:border-[#86691c]"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Unique Visitors', value: totals.unique_visitors || 0, color: 'text-blue-600' },
          { label: 'Page Views', value: totals.page_views || 0, color: 'text-gray-900' },
          { label: 'Post Views', value: totals.post_views || 0, color: 'text-[#86691c]' },
          { label: 'Total Comments', value: totalComments, color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-3xl font-serif ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* PER POST PERFORMANCE TABLE */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-medium text-gray-900">Post Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Post</th>
                  <th className="text-center p-4 text-xs font-semibold text-gray-600 uppercase">Views</th>
                  <th className="text-center p-4 text-xs font-semibold text-gray-600 uppercase">Reactions</th>
                  <th className="text-center p-4 text-xs font-semibold text-gray-600 uppercase">Comments</th>
                </tr>
              </thead>
              <tbody>
                {perPost?.map((post: any) => (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{post.category}</p>
                    </td>
                    <td className="p-4 text-center text-sm font-medium text-[#86691c]">{post.views}</td>
                    <td className="p-4 text-center text-sm text-gray-700">{post.reactions}</td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-gray-700">{post.comments}</span>
                      {post.pending_comments > 0 && (
                        <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">
                          {post.pending_comments} pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!perPost || perPost.length === 0) && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No post data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMMENT BREAKDOWN */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-medium text-gray-900 mb-4">Comment Moderation</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-100">
              <span className="text-sm font-medium text-yellow-800">Pending Approval</span>
              <span className="text-lg font-bold text-yellow-800">{pendingComments}</span>
            </div>
            {commentStats?.filter((s: any) => s.status !== 'pending').map((stat: any) => (
              <div key={stat.status} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <span className="text-sm font-medium text-gray-700 capitalize">{stat.status}</span>
                <span className="text-lg font-bold text-gray-900">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* RECENT COMMENTS */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Recent Comments</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentComments?.map((comment: any) => (
              <div key={comment.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">{comment.author_name}</span>
                  <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${
                    comment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>{comment.status}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{comment.content}</p>
                <p className="text-xs text-[#86691c] mt-2 font-medium">On: {comment.post_title}</p>
              </div>
            ))}
            {(!recentComments || recentComments.length === 0) && (
              <p className="p-6 text-sm text-gray-500">No comments yet.</p>
            )}
          </div>
        </div>

        {/* REFERRERS */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Top Referrers</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {referrers?.map((ref: any, i: number) => (
              <div key={i} className="p-4 flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate max-w-[80%]">{ref.referrer || 'Direct'}</span>
                <span className="text-sm font-bold text-gray-900">{ref.count}</span>
              </div>
            ))}
            {(!referrers || referrers.length === 0) && (
              <p className="p-6 text-sm text-gray-500">No referrer data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}