import { Config } from "@remotion/cli/config";

// Sandbox has no Chrome download access — use the preinstalled headless shell.
Config.setBrowserExecutable(
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
);
// Software WebGL so the 3D knife renders without a GPU.
Config.setChromiumOpenGlRenderer("swangle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16);
