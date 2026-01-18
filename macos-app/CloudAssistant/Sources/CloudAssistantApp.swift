import SwiftUI

/// Cloud Assistant - Personal AI Assistant for macOS
/// Optimized for Apple Silicon
@main
struct CloudAssistantApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var voiceManager = VoiceManager()
    @StateObject private var backendClient = BackendClient()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(voiceManager)
                .environmentObject(backendClient)
        }
        .windowStyle(.hiddenTitleBar)
        .defaultSize(width: 400, height: 600)

        // Menu bar extra for quick access
        MenuBarExtra("Cloud Assistant", systemImage: "brain.head.profile") {
            MenuBarView()
                .environmentObject(appState)
                .environmentObject(voiceManager)
        }
        .menuBarExtraStyle(.window)
    }
}

/// Global app state
class AppState: ObservableObject {
    @Published var isListening = false
    @Published var currentView: AppView = .chat
    @Published var pendingApprovals: [ApprovalRequest] = []
    @Published var unreadEmails: Int = 0
    @Published var upcomingEvents: Int = 0

    enum AppView {
        case chat
        case emails
        case calendar
        case settings
    }
}

/// Approval request for emails and other actions
struct ApprovalRequest: Identifiable {
    let id: String
    let type: ApprovalType
    let title: String
    let content: String
    let timestamp: Date
    var status: ApprovalStatus

    enum ApprovalType {
        case email
        case calendarEvent
        case taskDelegation
    }

    enum ApprovalStatus {
        case pending
        case approved
        case rejected
        case edited
    }
}
