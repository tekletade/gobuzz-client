interface VideoPlayerProps {
  videoType: string;
  videoId: string;
  thumbnail?: string | null;
  title?: string;
}

export default function VideoPlayer({
  videoType,
  videoId,
  thumbnail,
  title,
}: VideoPlayerProps) {
  if (videoType === 'youtube') {
    return (
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (videoType === 'vimeo') {
    return (
      <div className="aspect-video w-full">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title={title || 'Video'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (videoType === 'direct') {
    return (
      <video
        controls
        poster={thumbnail || undefined}
        className="w-full aspect-video"
      >
        <source src={videoId} />
      </video>
    );
  }

  return null;
}