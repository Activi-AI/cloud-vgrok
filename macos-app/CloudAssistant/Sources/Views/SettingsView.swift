import SwiftUI

/// Settings view for configuring the Cloud Assistant
struct SettingsView: View {
    @AppStorage("backendURL") private var backendURL = "http://localhost:3000"
    @AppStorage("voiceEnabled") private var voiceEnabled = true
    @AppStorage("voiceLanguage") private var voiceLanguage = "de-DE"
    @AppStorage("autoStartListening") private var autoStartListening = false
    @AppStorage("emailNotifications") private var emailNotifications = true
    @AppStorage("calendarReminders") private var calendarReminders = true
    @AppStorage("reminderMinutes") private var reminderMinutes = 15
    @AppStorage("darkMode") private var darkMode = false

    @EnvironmentObject var backendClient: BackendClient
    @State private var isTestingConnection = false
    @State private var connectionStatus: ConnectionStatus = .unknown

    enum ConnectionStatus {
        case unknown
        case connected
        case failed(String)
    }

    var body: some View {
        Form {
            // Backend Settings
            Section("Backend") {
                TextField("Server URL", text: $backendURL)
                    .textFieldStyle(.roundedBorder)
                    .accessibilityIdentifier("settings_input_backendUrl")

                HStack {
                    Button("Verbindung testen") {
                        testConnection()
                    }
                    .disabled(isTestingConnection)
                    .accessibilityIdentifier("settings_button_testConnection")

                    if isTestingConnection {
                        ProgressView()
                            .scaleEffect(0.7)
                    }

                    Spacer()

                    connectionStatusView
                }
            }

            // Voice Settings
            Section("Sprache") {
                Toggle("Sprachsteuerung aktiviert", isOn: $voiceEnabled)
                    .accessibilityIdentifier("settings_toggle_voiceEnabled")

                Picker("Sprache", selection: $voiceLanguage) {
                    Text("Deutsch").tag("de-DE")
                    Text("English").tag("en-US")
                }
                .disabled(!voiceEnabled)
                .accessibilityIdentifier("settings_picker_voiceLanguage")

                Toggle("Automatisch zuhören bei Start", isOn: $autoStartListening)
                    .disabled(!voiceEnabled)
                    .accessibilityIdentifier("settings_toggle_autoStartListening")
            }

            // Notification Settings
            Section("Benachrichtigungen") {
                Toggle("Email-Benachrichtigungen", isOn: $emailNotifications)
                    .accessibilityIdentifier("settings_toggle_emailNotifications")

                Toggle("Kalender-Erinnerungen", isOn: $calendarReminders)
                    .accessibilityIdentifier("settings_toggle_calendarReminders")

                if calendarReminders {
                    Stepper(
                        "\(reminderMinutes) Minuten vorher",
                        value: $reminderMinutes,
                        in: 5...60,
                        step: 5
                    )
                    .accessibilityIdentifier("settings_stepper_reminderMinutes")
                }
            }

            // Appearance
            Section("Darstellung") {
                Toggle("Dunkler Modus", isOn: $darkMode)
                    .accessibilityIdentifier("settings_toggle_darkMode")
            }

            // Email Style Training
            Section("Email-Stil Training") {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Der Assistent lernt deinen Schreibstil aus gesendeten Emails.")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        Button("Training starten") {
                            // Start training
                        }
                        .accessibilityIdentifier("settings_button_startTraining")

                        Button("Training zurücksetzen") {
                            // Reset training
                        }
                        .foregroundColor(.red)
                        .accessibilityIdentifier("settings_button_resetTraining")
                    }

                    // Training status
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("247 Emails analysiert")
                            .font(.caption)
                    }
                }
            }

            // About
            Section("Info") {
                LabeledContent("Version", value: "1.0.0")
                LabeledContent("Build", value: "2026.01.18")

                Link("GitHub Repository", destination: URL(string: "https://github.com/Activi-AI/cloud-vgrok")!)
                    .accessibilityIdentifier("settings_link_github")
            }
        }
        .formStyle(.grouped)
        .navigationTitle("Einstellungen")
    }

    @ViewBuilder
    private var connectionStatusView: some View {
        switch connectionStatus {
        case .unknown:
            EmptyView()
        case .connected:
            Label("Verbunden", systemImage: "checkmark.circle.fill")
                .foregroundColor(.green)
        case .failed(let error):
            Label(error, systemImage: "xmark.circle.fill")
                .foregroundColor(.red)
                .lineLimit(1)
        }
    }

    private func testConnection() {
        isTestingConnection = true
        connectionStatus = .unknown

        Task {
            do {
                // Simple health check
                let url = URL(string: backendURL)!.appendingPathComponent("/health")
                let (_, response) = try await URLSession.shared.data(from: url)

                await MainActor.run {
                    if let httpResponse = response as? HTTPURLResponse,
                       (200...299).contains(httpResponse.statusCode) {
                        connectionStatus = .connected
                    } else {
                        connectionStatus = .failed("Server nicht erreichbar")
                    }
                    isTestingConnection = false
                }
            } catch {
                await MainActor.run {
                    connectionStatus = .failed(error.localizedDescription)
                    isTestingConnection = false
                }
            }
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(BackendClient())
}
