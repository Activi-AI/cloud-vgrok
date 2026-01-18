import SwiftUI

/// Calendar view showing upcoming events
struct CalendarView: View {
    @EnvironmentObject var backendClient: BackendClient
    @State private var events: [CalendarEvent] = []
    @State private var selectedDate = Date()
    @State private var isLoading = false

    var body: some View {
        HSplitView {
            // Calendar picker
            VStack {
                DatePicker(
                    "Datum",
                    selection: $selectedDate,
                    displayedComponents: [.date]
                )
                .datePickerStyle(.graphical)
                .padding()
                .accessibilityIdentifier("calendar_picker_date")

                Spacer()
            }
            .frame(width: 300)

            // Events list
            VStack(alignment: .leading, spacing: 0) {
                // Header
                HStack {
                    Text(selectedDate, style: .date)
                        .font(.title2)
                        .fontWeight(.semibold)

                    Spacer()

                    Button {
                        // Add new event
                    } label: {
                        Label("Neuer Termin", systemImage: "plus")
                    }
                    .accessibilityIdentifier("calendar_button_addEvent")
                }
                .padding()

                Divider()

                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if filteredEvents.isEmpty {
                    ContentUnavailableView(
                        "Keine Termine",
                        systemImage: "calendar.badge.exclamationmark",
                        description: Text("An diesem Tag sind keine Termine geplant")
                    )
                } else {
                    List(filteredEvents) { event in
                        CalendarEventRow(event: event)
                    }
                    .listStyle(.inset)
                    .accessibilityIdentifier("calendar_list_events")
                }
            }
        }
        .navigationTitle("Kalender")
        .task {
            await loadEvents()
        }
    }

    private var filteredEvents: [CalendarEvent] {
        events.filter { Calendar.current.isDate($0.startTime, inSameDayAs: selectedDate) }
    }

    private func loadEvents() async {
        isLoading = true
        defer { isLoading = false }

        // Mock data for now
        events = [
            CalendarEvent(
                id: "1",
                title: "Team Standup",
                startTime: Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: Date())!,
                endTime: Calendar.current.date(bySettingHour: 9, minute: 30, second: 0, of: Date())!,
                location: "Zoom",
                attendees: ["Max", "Anna", "Tom"]
            ),
            CalendarEvent(
                id: "2",
                title: "Client Call",
                startTime: Calendar.current.date(bySettingHour: 14, minute: 0, second: 0, of: Date())!,
                endTime: Calendar.current.date(bySettingHour: 15, minute: 0, second: 0, of: Date())!,
                location: nil,
                attendees: ["Client"]
            ),
        ]
    }
}

/// Calendar event model
struct CalendarEvent: Identifiable {
    let id: String
    let title: String
    let startTime: Date
    let endTime: Date
    let location: String?
    let attendees: [String]
}

/// Calendar event row
struct CalendarEventRow: View {
    let event: CalendarEvent
    @State private var isHovered = false

    var body: some View {
        HStack(spacing: 12) {
            // Time column
            VStack(alignment: .trailing) {
                Text(event.startTime, style: .time)
                    .font(.headline)
                Text(event.endTime, style: .time)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .frame(width: 60)

            // Color bar
            Rectangle()
                .fill(Color.accentColor)
                .frame(width: 4)
                .clipShape(RoundedRectangle(cornerRadius: 2))

            // Event details
            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(.headline)

                if let location = event.location {
                    Label(location, systemImage: "location")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                if !event.attendees.isEmpty {
                    Label(event.attendees.joined(separator: ", "), systemImage: "person.2")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            // Reminder indicator
            if isUpcoming {
                Text(event.startTime, style: .relative)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.orange.opacity(0.2))
                    .clipShape(Capsule())
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 4)
        .background(isHovered ? Color.secondary.opacity(0.1) : Color.clear)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .onHover { hovering in
            isHovered = hovering
        }
        .accessibilityIdentifier("calendar_event_\(event.id)")
    }

    private var isUpcoming: Bool {
        let now = Date()
        let fifteenMinutesFromNow = now.addingTimeInterval(15 * 60)
        return event.startTime > now && event.startTime < fifteenMinutesFromNow
    }
}

#Preview {
    CalendarView()
        .environmentObject(BackendClient())
}
