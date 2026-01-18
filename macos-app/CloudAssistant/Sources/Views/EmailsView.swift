import SwiftUI

/// Emails view with inbox, drafts, and approval flow
struct EmailsView: View {
    @EnvironmentObject var backendClient: BackendClient
    @State private var emails: [Email] = []
    @State private var selectedEmail: Email?
    @State private var selectedTab: EmailTab = .inbox
    @State private var showingDraftEditor = false
    @State private var currentDraft: EmailDraft?

    enum EmailTab {
        case inbox
        case drafts
        case sent
    }

    var body: some View {
        NavigationSplitView {
            VStack(spacing: 0) {
                // Tab selector
                Picker("", selection: $selectedTab) {
                    Text("Posteingang").tag(EmailTab.inbox)
                    Text("Entwürfe").tag(EmailTab.drafts)
                    Text("Gesendet").tag(EmailTab.sent)
                }
                .pickerStyle(.segmented)
                .padding()
                .accessibilityIdentifier("emails_picker_tabs")

                // Email list
                List(filteredEmails, selection: $selectedEmail) { email in
                    EmailRow(email: email)
                        .tag(email)
                }
                .listStyle(.inset)
                .accessibilityIdentifier("emails_list_messages")
            }
            .frame(minWidth: 300)

        } detail: {
            if let email = selectedEmail {
                EmailDetailView(email: email, onReply: { draft in
                    currentDraft = draft
                    showingDraftEditor = true
                })
            } else {
                ContentUnavailableView(
                    "Keine Email ausgewählt",
                    systemImage: "envelope",
                    description: Text("Wähle eine Email aus der Liste")
                )
            }
        }
        .navigationTitle("Emails")
        .sheet(isPresented: $showingDraftEditor) {
            if let draft = currentDraft {
                EmailDraftEditor(draft: draft) { action in
                    handleDraftAction(action)
                }
            }
        }
        .task {
            await loadEmails()
        }
    }

    private var filteredEmails: [Email] {
        switch selectedTab {
        case .inbox:
            return emails.filter { !$0.isDraft && !$0.isSent }
        case .drafts:
            return emails.filter { $0.isDraft }
        case .sent:
            return emails.filter { $0.isSent }
        }
    }

    private func loadEmails() async {
        // Load from backend
    }

    private func handleDraftAction(_ action: DraftAction) {
        showingDraftEditor = false

        switch action {
        case .send:
            // Request approval before sending
            break
        case .save:
            // Save draft
            break
        case .discard:
            currentDraft = nil
        }
    }
}

/// Email model
struct Email: Identifiable, Hashable {
    let id: String
    let from: String
    let to: String
    let subject: String
    let body: String
    let timestamp: Date
    let isRead: Bool
    let isDraft: Bool
    let isSent: Bool
    let priority: EmailPriority
    let suggestedReply: String?

    enum EmailPriority {
        case urgent
        case normal
        case low
    }
}

/// Email row in list
struct EmailRow: View {
    let email: Email

    var body: some View {
        HStack(spacing: 12) {
            // Priority indicator
            Circle()
                .fill(priorityColor)
                .frame(width: 8, height: 8)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(email.from)
                        .font(.headline)
                        .lineLimit(1)

                    Spacer()

                    Text(email.timestamp, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Text(email.subject)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            if !email.isRead {
                Circle()
                    .fill(Color.accentColor)
                    .frame(width: 10, height: 10)
            }
        }
        .padding(.vertical, 4)
        .accessibilityIdentifier("emails_row_\(email.id)")
    }

    private var priorityColor: Color {
        switch email.priority {
        case .urgent: return .red
        case .normal: return .orange
        case .low: return .green
        }
    }
}

/// Email detail view
struct EmailDetailView: View {
    let email: Email
    let onReply: (EmailDraft) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text(email.subject)
                        .font(.title2)
                        .fontWeight(.semibold)

                    HStack {
                        Text("Von: \(email.from)")
                        Spacer()
                        Text(email.timestamp, style: .date)
                    }
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                }
                .accessibilityIdentifier("emails_detail_header")

                Divider()

                // Body
                Text(email.body)
                    .textSelection(.enabled)
                    .accessibilityIdentifier("emails_detail_body")

                Divider()

                // AI Suggested Reply
                if let suggestedReply = email.suggestedReply {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("KI-Vorschlag", systemImage: "sparkles")
                            .font(.headline)
                            .foregroundColor(.accentColor)

                        Text(suggestedReply)
                            .padding()
                            .background(Color.accentColor.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 8))

                        HStack {
                            Button("Verwenden") {
                                let draft = EmailDraft(
                                    to: email.from,
                                    subject: "Re: \(email.subject)",
                                    body: suggestedReply,
                                    replyToId: email.id
                                )
                                onReply(draft)
                            }
                            .buttonStyle(.borderedProminent)
                            .accessibilityIdentifier("emails_button_useSuggestion")

                            Button("Bearbeiten") {
                                let draft = EmailDraft(
                                    to: email.from,
                                    subject: "Re: \(email.subject)",
                                    body: suggestedReply,
                                    replyToId: email.id
                                )
                                onReply(draft)
                            }
                            .accessibilityIdentifier("emails_button_editSuggestion")
                        }
                    }
                    .padding()
                    .background(Color(NSColor.controlBackgroundColor))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .accessibilityIdentifier("emails_detail_suggestion")
                }
            }
            .padding()
        }
        .toolbar {
            ToolbarItemGroup {
                Button {
                    let draft = EmailDraft(
                        to: email.from,
                        subject: "Re: \(email.subject)",
                        body: "",
                        replyToId: email.id
                    )
                    onReply(draft)
                } label: {
                    Label("Antworten", systemImage: "arrowshape.turn.up.left")
                }
                .accessibilityIdentifier("emails_toolbar_reply")
            }
        }
    }
}

/// Email draft model
struct EmailDraft {
    var to: String
    var subject: String
    var body: String
    var replyToId: String?
}

/// Draft action
enum DraftAction {
    case send
    case save
    case discard
}

/// Email draft editor with approval flow
struct EmailDraftEditor: View {
    @State var draft: EmailDraft
    let onAction: (DraftAction) -> Void
    @State private var showingApproval = false

    var body: some View {
        NavigationStack {
            Form {
                TextField("An", text: $draft.to)
                    .accessibilityIdentifier("emails_draft_input_to")

                TextField("Betreff", text: $draft.subject)
                    .accessibilityIdentifier("emails_draft_input_subject")

                TextEditor(text: $draft.body)
                    .frame(minHeight: 200)
                    .accessibilityIdentifier("emails_draft_input_body")
            }
            .padding()
            .navigationTitle("Neue Email")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Verwerfen") {
                        onAction(.discard)
                    }
                    .accessibilityIdentifier("emails_draft_button_discard")
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Senden") {
                        showingApproval = true
                    }
                    .buttonStyle(.borderedProminent)
                    .accessibilityIdentifier("emails_draft_button_send")
                }
            }
            .alert("Email senden?", isPresented: $showingApproval) {
                Button("Senden", role: .none) {
                    onAction(.send)
                }
                .accessibilityIdentifier("emails_alert_button_confirm")

                Button("Abbrechen", role: .cancel) {}
                .accessibilityIdentifier("emails_alert_button_cancel")
            } message: {
                Text("Möchtest du diese Email an \(draft.to) senden?")
            }
        }
    }
}

#Preview {
    EmailsView()
        .environmentObject(BackendClient())
}
