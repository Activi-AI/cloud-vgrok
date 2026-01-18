// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CloudAssistant",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "CloudAssistant", targets: ["CloudAssistant"])
    ],
    dependencies: [
        // WebSocket for real-time communication with backend
        .package(url: "https://github.com/vapor/websocket-kit.git", from: "2.0.0"),
        // Keychain access for secure storage
        .package(url: "https://github.com/kishikawakatsumi/KeychainAccess.git", from: "4.2.0"),
    ],
    targets: [
        .executableTarget(
            name: "CloudAssistant",
            dependencies: [
                .product(name: "WebSocketKit", package: "websocket-kit"),
                .product(name: "KeychainAccess", package: "KeychainAccess"),
            ],
            path: "Sources"
        ),
        .testTarget(
            name: "CloudAssistantTests",
            dependencies: ["CloudAssistant"],
            path: "Tests"
        )
    ]
)
