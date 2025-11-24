export default function YouTubeStream({ channelId }: { channelId: string | null | undefined }) {
  if (!channelId) {
    return (
      <div className="w-[90%] mx-auto aspect-video border border-border flex items-center justify-center bg-black shadow-sm">
        <p className="text-sm text-muted-foreground">Stream not available</p>
      </div>
    );
  }

  // Use YouTube live stream embed URL with autoplay and mute
  const embedUrl = `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1`;

  return (
    <div className="w-[90%] mx-auto aspect-video border border-border overflow-hidden bg-black shadow-sm">
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title="Live Stream"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ display: 'block', width: '100%', height: '100%' }}
      ></iframe>
    </div>
  );
}
