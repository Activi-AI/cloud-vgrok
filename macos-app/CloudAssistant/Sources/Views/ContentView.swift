import SwiftUI

/// Main content view with sidebar navigation
struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var voiceManager: VoiceManager

    var body: some View {
        NavigationSplitView {
            // Sidebar
            List(selection: $appState.currentView) {
                NavigationLink(value: AppState.AppView.chat) {
                    Label("Chat", systemImage: "bubble.left.and.bubble.right")
                }
                .accessibilityIdentifier("sidebar_button_chat")

                NavigationLink(value: AppState.AppView.emails) {
                    Label {
                        Text("Emails")
                        if appState.unreadEmails > 0 {
                            Badge(count: appState.unreadEmails)
                        }
                    } icon: {
                        Image(systemName: "envelope")
                    }
                }
                .accessibilityIdentifier("sidebar_button_emails")

                NavigationLink(value: AppState.AppView.calendar) {
                    Label {
                        Text("Kalender")
                        if appState.upcomingEvents > 0 {
                            Badge(count: appState.upcomingEvents)
                        }
                    } icon: {
                        Image(systemName: "calendar")
                    }
                }
                .accessibilityIdentifier("sidebar_button_calendar")

                Divider()

                NavigationLink(value: AppState.AppView.settings) {
                    Label("Einstellungen", systemImage: "gear")
                }
                .accessibilityIdentifier("sidebar_button_settings")
            }
            .listStyle(.sidebar)
            .frame(minWidth: 200)

        } detail: {
            // Main content area
            switch appState.currentView {
            case .chat:
                ChatView()
            case .emails:
                EmailsView()
            case .calendar:
                CalendarView()
            case .settings:
                SettingsView()
            }
        }
        .toolbar {
            ToolbarItem(placement: .navigation) {
                VoiceButton()
                    .accessibilityIdentifier("toolbar_button_voice")
            }

            ToolbarItem(placement: .primaryAction) {
                if !appState.pendingApprovals.isEmpty {
                    Button {
                        // Show approvals sheet
                    } label: {
                        Label("Genehmigungen", systemImage: "checkmark.circle")
                            .badge(appState.pendingApprovals.count)
                    }
                    .accessibilityIdentifier("toolbar_button_approvals")
                }
            }
        }
    }
}

/// Badge view for counts
struct Badge: View {
    let count: Int

    var body: some View {
        Text("\(count)")
            .font(.caption2)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(Color.red)
            .foregroundColor(.white)
            .clipShape(Capsule())
    }
}

/// Voice activation button
struct VoiceButton: View {
    @EnvironmentObject var voiceManager: VoiceManager
    @EnvironmentObject var appState: AppState

    var body: some View {
        Button {
            if appState.isListening {
                voiceManager.stopListening()
            } else {
                voiceManager.startListening()
            }
            appState.isListening.toggle()
        } label: {
            Image(systemName: appState.isListening ? "waveform.circle.fill" : "mic.circle")
                .font(.title2)
                .foregroundColor(appState.isListening ? .red : .primary)
        }
        .keyboardShortcut("m", modifiers: [.command, .shift])
        .help("Spracheingabe (⌘⇧M)")
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
        .environmentObject(VoiceManager())
}
