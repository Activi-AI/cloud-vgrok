import Foundation
import Combine
import KeychainAccess

/// Client for communicating with the Cloud Assistant backend
class BackendClient: ObservableObject {
    // MARK: - Published Properties

    @Published var isConnected = false
    @Published var connectionError: String?

    // MARK: - Private Properties

    private let baseURL: URL
    private let keychain = Keychain(service: "com.activi.cloudassistant")
    private var webSocketTask: URLSessionWebSocketTask?
    private let session: URLSession
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization

    init(baseURL: String = "http://localhost:3000") {
        self.baseURL = URL(string: baseURL)!

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 300
        self.session = URLSession(configuration: config)
    }

    // MARK: - Authentication

    /// Get stored API token
    var apiToken: String? {
        get { try? keychain.get("apiToken") }
        set {
            if let value = newValue {
                try? keychain.set(value, key: "apiToken")
            } else {
                try? keychain.remove("apiToken")
            }
        }
    }

    // MARK: - Chat API

    /// Send a message to the Cloud Assistant
    func sendMessage(_ message: String) async throws -> ChatResponse {
        let endpoint = baseURL.appendingPathComponent("/api/chat")

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = apiToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let body = ChatRequest(message: message)
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw BackendError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw BackendError.httpError(httpResponse.statusCode)
        }

        return try JSONDecoder().decode(ChatResponse.self, from: data)
    }

    // MARK: - Email API

    /// Fetch emails from backend
    func fetchEmails(folder: String = "inbox") async throws -> [EmailResponse] {
        let endpoint = baseURL.appendingPathComponent("/api/emails")
        var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: true)!
        components.queryItems = [URLQueryItem(name: "folder", value: folder)]

        var request = URLRequest(url: components.url!)
        request.httpMethod = "GET"

        if let token = apiToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw BackendError.invalidResponse
        }

        return try JSONDecoder().decode([EmailResponse].self, from: data)
    }

    /// Send email (requires approval)
    func sendEmail(_ draft: EmailDraftRequest) async throws -> EmailSendResponse {
        let endpoint = baseURL.appendingPathComponent("/api/emails/send")

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = apiToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        request.httpBody = try JSONEncoder().encode(draft)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw BackendError.invalidResponse
        }

        return try JSONDecoder().decode(EmailSendResponse.self, from: data)
    }

    /// Get AI suggested reply for an email
    func getSuggestedReply(emailId: String) async throws -> SuggestedReplyResponse {
        let endpoint = baseURL.appendingPathComponent("/api/emails/\(emailId)/suggest-reply")

        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"

        if let token = apiToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw BackendError.invalidResponse
        }

        return try JSONDecoder().decode(SuggestedReplyResponse.self, from: data)
    }

    // MARK: - Calendar API

    /// Fetch upcoming events
    func fetchEvents(days: Int = 7) async throws -> [CalendarEventResponse] {
        let endpoint = baseURL.appendingPathComponent("/api/calendar/events")
        var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: true)!
        components.queryItems = [URLQueryItem(name: "days", value: String(days))]

        var request = URLRequest(url: components.url!)
        request.httpMethod = "GET"

        if let token = apiToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw BackendError.invalidResponse
        }

        return try JSONDecoder().decode([CalendarEventResponse].self, from: data)
    }

    // MARK: - WebSocket

    /// Connect to WebSocket for real-time updates
    func connectWebSocket() {
        let wsURL = baseURL
            .deletingLastPathComponent()
            .appendingPathComponent("ws")

        var request = URLRequest(url: wsURL)
        if let token = apiToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        webSocketTask = session.webSocketTask(with: request)
        webSocketTask?.resume()

        isConnected = true
        receiveWebSocketMessage()
    }

    /// Disconnect WebSocket
    func disconnectWebSocket() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        isConnected = false
    }

    private func receiveWebSocketMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    self?.handleWebSocketMessage(text)
                case .data(let data):
                    if let text = String(data: data, encoding: .utf8) {
                        self?.handleWebSocketMessage(text)
                    }
                @unknown default:
                    break
                }
                self?.receiveWebSocketMessage()

            case .failure(let error):
                print("[BackendClient] WebSocket error: \(error)")
                DispatchQueue.main.async {
                    self?.isConnected = false
                    self?.connectionError = error.localizedDescription
                }
            }
        }
    }

    private func handleWebSocketMessage(_ text: String) {
        // Handle real-time updates from backend
        // e.g., new emails, calendar reminders, task completions
    }

    // MARK: - Errors

    enum BackendError: Error, LocalizedError {
        case invalidResponse
        case httpError(Int)
        case decodingError

        var errorDescription: String? {
            switch self {
            case .invalidResponse:
                return "Invalid response from server"
            case .httpError(let code):
                return "HTTP error: \(code)"
            case .decodingError:
                return "Failed to decode response"
            }
        }
    }
}

// MARK: - Request/Response Models

struct ChatRequest: Codable {
    let message: String
}

struct ChatResponse: Codable {
    let content: String
    let agentId: String?
    let taskId: String?
}

struct EmailResponse: Codable {
    let id: String
    let from: String
    let to: String
    let subject: String
    let body: String
    let timestamp: Date
    let isRead: Bool
    let priority: String
}

struct EmailDraftRequest: Codable {
    let to: String
    let subject: String
    let body: String
    let replyToId: String?
}

struct EmailSendResponse: Codable {
    let success: Bool
    let messageId: String?
    let error: String?
}

struct SuggestedReplyResponse: Codable {
    let suggestedReply: String
    let confidence: Double
    let styleMatch: Double
}

struct CalendarEventResponse: Codable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
    let location: String?
    let attendees: [String]
}
