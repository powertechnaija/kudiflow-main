{ pkgs, ... }: {
  # See https://idx.dev/docs/config/dev-nix for more options.
  channel = "stable-24.05"; # or "unstable"
  packages = [
    # Use a compatible Node.js version as required by Vite
    pkgs.nodejs_22 # Updated Node.js to version 22 for compatibility
  ];
  idx = {
    # Search for extensions on https://open-vsx.org/.
    extensions = [
      "dbaeumer.vscode-eslint"
    ];
    workspace = {
      # Runs when a workspace is first created.
      onCreate = {
        npm-install = "npm install";
      };
      # Runs every time the workspace is (re)started.
      onStart = {
        dev-server = "npm run dev";
      };
    };
    # Previews configuration for the web server.
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
