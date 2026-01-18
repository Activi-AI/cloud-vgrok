import SwiftUI

/// Menu bar view for quick access to Cloud Assistant
struct MenuBarView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var voiceManager: VoiceManager
    @State private var quickInput = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Image(systemName: "brain.head.profile")
                    .font(.title2)
                    .foregroundColor(.accentColor)

                Text("Cloud Assistant")
                    .font(.headline)

                Spacer()

                // Voice button
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
                .buttonStyle(.plain)
                .accessibilityIdentifier("menubar_button_voice")
            }
            .padding(.horizontal)
            .padding(.top, 8)

            Divider()

            // Quick input
            HStack {
                TextField("Frag mich etwas...", text: $quickInput)
                    .textFieldStyle(.plain)
                    .onSubmit {
                        sendQuickMessage()
                    }
                    .accessibilityIdentifier("menubar_input_quick")

                Button {
                    sendQuickMessage()
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .foregroundColor(quickInput.isEmpty ? .gray : .accentColor)
                }
                .disabled(quickInput.isEmpty)
                .buttonStyle(.plain)
                .accessibilityIdentifier("menubar_button_send")
            }
            .padding(.horizontal)

            Divider()

            // Quick stats
            VStack(alignment: .leading, spacing: 8) {
                if appState.unreadEmails > 0 {
                    HStack {
                        Image(systemName: "envelope.badge")
                            .foregroundColor(.blue)
                        Text("\(appState.unreadEmails) ungelesene Emails")
                        Spacer()
                    }
                    .accessibilityIdentifier("menubar_stat_emails")
                }

                if appState.upcomingEvents > 0 {
                    HStack {
                        Image(systemName: "calendar.badge.clock")
                            .foregroundColor(.orange)
                        Text("\(appState.upcomingEvents) anstehende Termine")
                        Spacer()
                    }
                    .accessibilityIdentifier("menubar_stat_events")
                }

                if !appState.pendingApprovals.isEmpty {
                    HStack {
                        Image(systemName: "checkmark.circle.badge.questionmark")
                            .foregroundColor(.yellow)
                        Text("\(appState.pendingApprovals.count) Genehmigungen ausstehend")
                        Spacer()
                    }
                    .accessibilityIdentifier("menubar_stat_approvals")
                }
            }
            .font(.caption)
            .padding(.horizontal)

            Divider()

            // Quick actions
            VStack(alignment: .leading, spacing: 4) {
                MenuBarButton(title: "App öffnen", icon: "macwindow") {
                    NSApp.activate(ignoringOtherApps: true)
                }
                .accessibilityIdentifier("menubar_button_openApp")

                MenuBarButton(title: "Emails prüfen", icon: "envelope") {
                    appState.currentView = .emails
                    NSApp.activate(ignoringOtherApps: true)
                }
                .accessibilityIdentifier("menubar_button_checkEmails")

                MenuBarButton(title: "Tagesplan", icon: "calendar") {
                    appState.currentView = .calendar
                    NSApp.activate(ignoringOtherApps: true)
                }
                .accessibilityIdentifier("menubar_button_showCalendar")

                Divider()

                MenuBarButton(title: "Einstellungen", icon: "gear") {
                    appState.currentView = .settings
                    NSApp.activate(ignoringOtherApps: true)
                }
                .accessibilityIdentifier("menubar_button_settings")

                MenuBarButton(title: "Beenden", icon: "power", isDestructive: true) {
                    NSApp.terminate(nil)
                }
                .accessibilityIdentifier("menubar_button_quit")
            }
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
        .frame(width: 280)
    }

    private func sendQuickMessage() {
        guard !quickInput.isEmpty else { return }
        // Send to backend
        quickInput = ""
    }
}

/// Menu bar button component
struct MenuBarButton: View {
    let title: String
    let icon: String
    var isDestructive = false
    let action: () -> Void

    @State private var isHovered = false

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .frame(width: 20)
                Text(title)
                Spacer()
            }
            .padding(.vertical, 6)
            .padding(.horizontal, 8)
            .background(isHovered ? Color.secondary.opacity(0.2) : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 6))
        }
        .buttonStyle(.plain)
        .foregroundColor(isDestructive ? .red : .primary)
        .onHover { hovering in
            isHovered = hovering
        }
    }
}

#Preview {
    MenuBarView()
        .environmentObject(AppState())
        .environmentObject(VoiceManager())
}
