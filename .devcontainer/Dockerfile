FROM node:22

# Install development tools
RUN apt-get update && apt-get install -y --no-install-recommends \
  less \
  git \
  procps \
  zsh \
  unzip \
  gnupg2 \
  gh \
  jq \
  nano \
  python3 \
  python3-pip \
  python3-venv \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies for the MCP server
RUN pip install --break-system-packages mcp

ENV DEVCONTAINER=true
ENV SHELL=/bin/zsh
ENV EDITOR=nano
ENV VISUAL=nano

RUN mkdir -p /workspace /root/.claude

WORKDIR /workspace

# Install Claude Code
RUN curl -fsSL https://claude.ai/install.sh | bash -s -- latest \
  && ln -sf /root/.local/bin/claude /usr/local/bin/claude 

# Install Cursor CLI (provides the 'agent' command)
RUN curl -fsSL https://cursor.com/install -fsS | bash \
  && ln -sf /root/.local/bin/agent /usr/local/bin/agent

# Make Claude and Cursor CLI available system-wide via PATH
ENV PATH="/root/.local/bin:${PATH}"

COPY init-plugins.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/init-plugins.sh