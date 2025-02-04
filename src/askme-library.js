export default class AskmeLibrary {

    constructor(config = {}) {
        this.config = {
            position: config.position || 'bottom-left',
            iconSrc: config.iconSrc || this.defaultIcon(),
            primaryColor: config.primaryColor || '#007bff',
            askmeName: config.askmeName || 'Assistant',
            tenant_id: '####TENANT_ID####',
            client_id: '####CLIENT_ID####',
            apiEndpoint: config.apiEndpoint || null
        };
        console.log('initializing askme interface with {}', JSON.stringify(config))
        this.init();
    }

    defaultIcon() {
        // Base64 encoded SVG of a chat bubble
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTIwIDJINGMtMS4xIDAtMS45OS45LTEuOTkgMkwyIDIybDQtNGgxNGMxLjEgMCAyLS45IDItMlY0YzAtMS4xLS45LTItMi0yem0tNyAxMkg3di0yaDZ2MnptMy00SDd2LTJoNnYyem00LTVINHYtMmgxNnYyeiIvPjwvc3ZnPg==';
    }

    init() {
        this.createAskmeContainer();
        this.createAskmeIcon();
        this.createChatInterface();
        this.attachEventListeners();
    }

    createAskmeContainer() {
        this.container = document.createElement('div');
        this.container.id = 'askme-library-container';
        this.container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      `;
        document.body.appendChild(this.container);
    }

    createAskmeIcon() {
        this.icon = document.createElement('img');
        this.icon.src = this.config.iconSrc;
        this.icon.id = 'askme-icon';
        this.icon.style.cssText = `
        width: 60px;
        height: 60px;
        cursor: pointer;
        border-radius: 50%;
        background-color: ${this.config.primaryColor};
        padding: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;
        this.container.appendChild(this.icon);
    }

    createChatInterface() {
        this.chatInterface = document.createElement('div');
        this.chatInterface.id = 'askme-interface';
        this.chatInterface.style.cssText = `
      display: none;
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      border: 2px solid ${this.config.primaryColor};
      flex-direction: column;
    `;

        this.chatInterface.innerHTML = `
    <div style="background-color: ${this.config.primaryColor}; color: white; padding: 15px; border-top-left-radius: 10px; border-top-right-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
      ${this.config.askmeName}
      <button id="askme-minimize" style="background: none; border: none; color: white; font-size: 20px;">&minus;</button>
    </div>
    <div id="askme-messages" style="max-height: 400px; overflow-y: auto; padding: 15px;"></div>
    <div style="display: flex;  margin-top: auto;">
      <input type="text" id="askme-input" placeholder="Type your message..." style="flex-grow: 1; padding: 10px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <button id="askme-send" style="margin-left: 10px; background-color: ${this.config.primaryColor}; color: white; border: none; padding: 10px 15px; border-radius: 5px;">Send</button>
    </div>
  `;
        this.container.appendChild(this.chatInterface);
    }


    minimizeChatInterface() {
        this.chatInterface.style.display = 'none';
        this.icon.style.display = 'block';
    }



    getRelevantAttributes(element) {
        const relevantAttrs = ['id', 'name', 'value'];
        const attrs = {};

        for (let attr of relevantAttrs) {
            if (element.hasAttribute(attr)) {
                attrs[attr] = element.getAttribute(attr);
            }
        }

        // Special handling for form elements
        if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
            if (element.value) attrs.value = element.value;
        }

        return Object.keys(attrs).length > 0 ? attrs : undefined;
    }
    extractDOMContent(rootElement = document.body) {
        return this.traverseDOM(rootElement);
    }
    traverseDOM(element) {
        // Skip script, style, and meta tags
        if (['SCRIPT', 'STYLE', 'META', 'LINK', 'button'].includes(element.tagName)) {
            return null;
        }

        const nodeInfo = {
            tag: element.tagName.toLowerCase(),
            attributes: this.getRelevantAttributes(element),
            text: this.getElementText(element)
        };

        // Process child nodes
        if (element.children && element.children.length > 0) {
            nodeInfo.children = Array.from(element.children)
                .map(child => this.traverseDOM(child))
                .filter(child => child !== null);
        }

        return nodeInfo;
    }

    getAttributes(element) {
        const attrs = {};
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs[attr.name] = attr.value;
        }
        return Object.keys(attrs).length > 0 ? attrs : undefined;
    }

    // Method to convert DOM to JSON string for easy transmission
    getDOMContentJSON(rootElement) {
        const domContent = this.extractDOMContent(rootElement);
        return JSON.stringify(domContent, null, 2);
    }

    getElementText(element) {
        // Get text content, trimming whitespace
        const text = element.textContent?.trim();
        return text && text.length > 0 ? text : undefined;
    }

    attachEventListeners() {
        this.icon.addEventListener('click', () => this.toggleChatInterface());
        const minimizeButton = this.chatInterface.querySelector('#askme-minimize');
        minimizeButton.addEventListener('click', () => this.minimizeChatInterface());

        const sendButton = this.chatInterface.querySelector('#askme-send');
        const inputField = this.chatInterface.querySelector('#askme-input');

        sendButton.addEventListener('click', () => this.sendMessage());
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChatInterface() {
        this.icon.style.display = 'none';
        this.chatInterface.style.display = 'flex';
    }

    sendMessage() {
        const inputField = document.getElementById('askme-input');
        const messagesContainer = document.getElementById('askme-messages');
        const message = inputField.value.trim();
        if (!message) return;
        const domContentJSON = this.getDOMContentJSON();
        console.log(domContentJSON)
        const payload_container = document.querySelector('#specific-container')
        if (payload_container) {
            const specificElementJSON = this.getDOMContentJSON(payload_container);
        }


        // Add user message
        this.addMessage('user', message);
        inputField.value = '';

        // Simulate response (replace with actual API call)
        if (this.config.apiEndpoint) {
            this.fetchResponse(message);
        } else {
            this.addMessage('bot', 'I received your message: ' + message);
        }
    }

    addMessage(sender, text) {
        const messagesContainer = document.getElementById('askme-messages');
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
        max-width: 80%;
        ${sender === 'user' ? 'align-self: flex-end; background-color: #e6f2ff; margin-left: auto;' : 'align-self: flex-start; background-color: #f0f0f0;'}
      `;
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    fetchResponseSSE(message) {
        const messagesContainer = document.getElementById('askme-messages');
        const botMessageElement = document.createElement('div');
        botMessageElement.style.cssText = 'margin-bottom: 10px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;';
        messagesContainer.appendChild(botMessageElement);

        try {
            const eventSource = new EventSource(`${this.config.apiEndpoint}?query=${encodeURIComponent(message)}`);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'start') {
                    botMessageElement.innerHTML = ''; // Clear previous content
                }

                if (data.type === 'content') {
                    botMessageElement.innerHTML += data.content;
                }

                if (data.type === 'end') {
                    eventSource.close();
                    this.logMessage('bot', botMessageElement.textContent);
                }

                // Auto-scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            };

            eventSource.onerror = (error) => {
                botMessageElement.innerHTML = 'Error fetching response';
                eventSource.close();
                console.error('SSE Error:', error);
            };
        } catch (error) {
            console.error('SSE Connection Error:', error);
        }
    }

    async fetchResponse(message) {
        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            this.addMessage('bot', data.response);
        } catch (error) {
            this.addMessage('bot', 'Sorry, I couldn\'t fetch a response.');
            console.error('AskMe API Error:', error);
        }
    }
}
