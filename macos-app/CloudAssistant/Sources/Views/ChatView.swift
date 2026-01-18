import SwiftUI

/// Chat view for conversational AI interaction
struct ChatView: View {
    @EnvironmentObject var backendClient: BackendClient
    @EnvironmentObject var voiceManager: VoiceManager
    @State private var inputText = ""
    @State private var messages: [ChatMessage] = []
    @State private var isProcessing = false

    var body: some View {
        VStack(spacing: 0) {
            // Messages list
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(messages) { message in
                            ChatBubble(message: message)
                                .id(message.id)
                        }

                        if isProcessing {
                            TypingIndicator()
                        }
                    }
                    .padding()
                }
                .onChange(of: messages.count) { _, _ in
                    withAnimation {
                        proxy.scrollTo(messages.last?.id, anchor: .bottom)
                    }
                }
            }
            .accessibilityIdentifier("chat_scrollview_messages")

            Divider()

            // Input area
            HStack(spacing: 12) {
                TextField("Nachricht eingeben...", text: $inputText, axis: .vertical)
                    .textFieldStyle(.plain)
                    .lineLimit(1...5)
                    .onSubmit {
                        sendMessage()
                    }
                    .accessibilityIdentifier("chat_input_message")

                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundColor(inputText.isEmpty ? .gray : .accentColor)
                }
                .disabled(inputText.isEmpty || isProcessing)
                .keyboardShortcut(.return, modifiers: [.command])
                .accessibilityIdentifier("chat_button_send")
            }
            .padding()
            .background(Color(NSColor.controlBackgroundColor))
        }
        .navigationTitle("Chat")
        .onReceive(voiceManager.$transcribedText) { text in
            if !text.isEmpty {
                inputText = text
                voiceManager.transcribedText = ""
            }
        }
    }

    private func sendMessage() {
        guard !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return
        }

        let userMessage = ChatMessage(
            role: .user,
            content: inputText
        )
        messages.append(userMessage)

        let messageToSend = inputText
        inputText = ""
        isProcessing = true

        Task {
            do {
                let response = try await backendClient.sendMessage(messageToSend)

                await MainActor.run {
                    let assistantMessage = ChatMessage(
                        role: .assistant,
                        content: response.content
                    )
                    messages.append(assistantMessage)
                    isProcessing = false

                    // Speak response if voice was used
                    if voiceManager.wasVoiceInput {
                        voiceManager.speak(response.content)
                        voiceManager.wasVoiceInput = false
                    }
                }
            } catch {
                await MainActor.run {
                    let errorMessage = ChatMessage(
                        role: .assistant,
                        content: "Fehler: \(error.localizedDescription)"
                    )
                    messages.append(errorMessage)
                    isProcessing = false
                }
            }
        }
    }
}

/// Chat message model
struct ChatMessage: Identifiable {
    let id = UUID()
    let role: Role
    let content: String
    let timestamp = Date()

    enum Role {
        case user
        case assistant
    }
}

/// Chat bubble view
struct ChatBubble: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.role == .user {
                Spacer()
            }

            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .padding(12)
                    .background(
                        message.role == .user
                            ? Color.accentColor
                            : Color(NSColor.controlBackgroundColor)
                    )
                    .foregroundColor(message.role == .user ? .white : .primary)
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .accessibilityIdentifier("chat_bubble_\(message.role)")

            if message.role == .assistant {
                Spacer()
            }
        }
    }
}

/// Typing indicator animation
struct TypingIndicator: View {
    @State private var animationOffset = 0

    var body: some View {
        HStack {
            HStack(spacing: 4) {
                ForEach(0..<3) { index in
                    Circle()
                        .fill(Color.secondary)
                        .frame(width: 8, height: 8)
                        .offset(y: animationOffset == index ? -4 : 0)
                }
            }
            .padding(12)
            .background(Color(NSColor.controlBackgroundColor))
            .clipShape(RoundedRectangle(cornerRadius: 16))

            Spacer()
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 0.3).repeatForever()) {
                animationOffset = (animationOffset + 1) % 3
            }
        }
        .accessibilityIdentifier("chat_indicator_typing")
    }
}

#Preview {
    ChatView()
        .environmentObject(BackendClient())
        .environmentObject(VoiceManager())
}
