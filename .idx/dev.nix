# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.jdk17
    pkgs.android-tools
    pkgs.gradle
  ];
  # Sets environment variables in the workspace
  env = {
    # Set the JAVA_HOME for Android builds
    JAVA_HOME = "${pkgs.jdk17}";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "dsznajder.es7-react-js-snippets"
      "bradlc.vscode-tailwindcss"
      "vscjava.vscode-java-pack"
    ];
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        npm-install = "npm install";
        # Add android platform if not already added
        # add-android = "npx cap add android";
      };
      # Runs when a workspace is (re)started
      onStart = {
        # Optional: run build to sync web assets
        # build-and-sync = "npm run build && npx cap sync android";
      };
    };
  };
}
