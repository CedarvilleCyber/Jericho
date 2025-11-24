// components/livestreamimage.tsx

// type State =
//   | { kind: "loading" }
//   | { kind: "ok" }
//   | { kind: "unauth" } // 401 not signed in
//   | { kind: "forbidden" } // 403 signed in but no permission
//   | { kind: "error"; msg: string };

export default function LiveStreamImage({
  height = "28rem",
}: {
  height?: string;
}) {
  return (
    <iframe
      src="https://jericho.alexthetaylor.com/stream"
      className="w-full h-full border-0 rounded-md shadow-lg"
      style={{ height }}
    ></iframe>
  );
}
