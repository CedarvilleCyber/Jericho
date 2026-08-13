package ui

import "embed"

// Files holds all UI assets (HTML, CSS, JS) embedded into the binary at compile time.
// Adding new files to the ui/css or ui/js directories will automatically include them.
//
//go:embed index.html css js images
var Files embed.FS
