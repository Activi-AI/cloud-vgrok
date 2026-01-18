import Foundation
import Speech
import AVFoundation
import Combine

/// Manages voice input (speech recognition) and output (text-to-speech)
/// Uses Apple's native Speech framework for recognition
/// Uses AVSpeechSynthesizer for TTS (can be replaced with ElevenLabs API)
class VoiceManager: NSObject, ObservableObject {
    // MARK: - Published Properties

    @Published var isListening = false
    @Published var transcribedText = ""
    @Published var wasVoiceInput = false
    @Published var isSpeaking = false
    @Published var authorizationStatus: SFSpeechRecognizerAuthorizationStatus = .notDetermined

    // MARK: - Private Properties

    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "de-DE"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    private let synthesizer = AVSpeechSynthesizer()

    // MARK: - Initialization

    override init() {
        super.init()
        synthesizer.delegate = self
        requestAuthorization()
    }

    // MARK: - Authorization

    private func requestAuthorization() {
        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            DispatchQueue.main.async {
                self?.authorizationStatus = status
            }
        }
    }

    // MARK: - Speech Recognition

    /// Start listening for voice input
    func startListening() {
        guard authorizationStatus == .authorized else {
            print("[VoiceManager] Not authorized for speech recognition")
            return
        }

        guard !audioEngine.isRunning else {
            print("[VoiceManager] Audio engine already running")
            return
        }

        do {
            try startRecognition()
            wasVoiceInput = true
            isListening = true
        } catch {
            print("[VoiceManager] Failed to start recognition: \(error)")
        }
    }

    /// Stop listening
    func stopListening() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionRequest = nil
        recognitionTask?.cancel()
        recognitionTask = nil
        isListening = false
    }

    private func startRecognition() throws {
        // Cancel any ongoing task
        recognitionTask?.cancel()
        recognitionTask = nil

        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)

        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            throw VoiceError.unableToCreateRequest
        }

        recognitionRequest.shouldReportPartialResults = true
        recognitionRequest.taskHint = .dictation

        // On-device recognition if available (privacy + speed)
        if #available(macOS 13, *) {
            recognitionRequest.requiresOnDeviceRecognition = speechRecognizer?.supportsOnDeviceRecognition ?? false
        }

        // Start recognition task
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            guard let self = self else { return }

            if let result = result {
                DispatchQueue.main.async {
                    self.transcribedText = result.bestTranscription.formattedString
                }

                // Auto-stop after silence
                if result.isFinal {
                    self.stopListening()
                }
            }

            if let error = error {
                print("[VoiceManager] Recognition error: \(error)")
                self.stopListening()
            }
        }

        // Configure audio input
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            self.recognitionRequest?.append(buffer)
        }

        audioEngine.prepare()
        try audioEngine.start()
    }

    // MARK: - Text-to-Speech

    /// Speak text using TTS
    func speak(_ text: String, rate: Float = 0.5) {
        // Stop any ongoing speech
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "de-DE")
        utterance.rate = rate
        utterance.pitchMultiplier = 1.0
        utterance.volume = 1.0

        isSpeaking = true
        synthesizer.speak(utterance)
    }

    /// Stop speaking
    func stopSpeaking() {
        synthesizer.stopSpeaking(at: .immediate)
        isSpeaking = false
    }

    // MARK: - Errors

    enum VoiceError: Error {
        case unableToCreateRequest
        case notAuthorized
    }
}

// MARK: - AVSpeechSynthesizerDelegate

extension VoiceManager: AVSpeechSynthesizerDelegate {
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.isSpeaking = false
        }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        DispatchQueue.main.async {
            self.isSpeaking = false
        }
    }
}
