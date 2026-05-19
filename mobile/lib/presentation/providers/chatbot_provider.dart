import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/api_constants.dart';

/// Chat message model.
class ChatMessage {
  final String id;
  final String text;
  final String sender; // 'user' | 'bot'
  final DateTime timestamp;

  const ChatMessage({
    required this.id,
    required this.text,
    required this.sender,
    required this.timestamp,
  });

  Map<String, dynamic> toApiFormat() => {
        'role': sender == 'user' ? 'user' : 'model',
        'content': text,
      };
}

/// Available AI models for chatbot.
class ChatModelOption {
  final String id;
  final String label;
  final String shortLabel;

  const ChatModelOption({
    required this.id,
    required this.label,
    required this.shortLabel,
  });
}

/// Chatbot state provider — manages chat history, AI model selection,
/// and communication with the Gemini API via the web proxy.
class ChatbotProvider extends ChangeNotifier {
  static const int _historyLimit = 20;

  static const List<ChatModelOption> models = [
    ChatModelOption(
      id: 'gemini-2.5-flash',
      label: 'Gemini 2.5 Flash',
      shortLabel: 'Flash',
    ),
    ChatModelOption(
      id: 'gemma-3-27b-it',
      label: 'Gemma 3 27B',
      shortLabel: 'Gemma',
    ),
  ];

  static const List<String> quickReplies = [
    'Apa stok kritis hari ini?',
    'Berikan rekomendasi restock',
    'Deteksi dead-stock',
    'Ringkas kondisi inventaris',
  ];

  static final ChatMessage _initialMessage = ChatMessage(
    id: 'initial',
    text:
        'Halo! 👋 Saya **Stokku AI**, asisten inventaris cerdas. '
        'Tanyakan soal stok, restock, dead-stock, atau forecast kapan saja.',
    sender: 'bot',
    timestamp: DateTime.now(),
  );

  final Dio _dio;

  List<ChatMessage> _messages = [];
  bool _isTyping = false;
  String _selectedModel = 'gemini-2.5-flash';
  String? _error;

  ChatbotProvider({Dio? dio})
      : _dio = dio ??
            Dio(BaseOptions(
              baseUrl: ApiConstants.chatBaseUrl,
              connectTimeout: const Duration(seconds: 30),
              receiveTimeout: const Duration(seconds: 60),
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            )) {
    _messages = [_initialMessage];
  }

  // ── Getters ──────────────────────────────────────────────
  List<ChatMessage> get messages => List.unmodifiable(_messages);
  bool get isTyping => _isTyping;
  String get selectedModel => _selectedModel;
  String? get error => _error;
  bool get hasMessages => _messages.length > 1;

  // ── Model selection ──────────────────────────────────────
  void setModel(String modelId) {
    _selectedModel = modelId;
    notifyListeners();
  }

  // ── Send message ─────────────────────────────────────────
  Future<void> sendMessage(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _isTyping) return;

    // Add user message
    final userMsg = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: trimmed,
      sender: 'user',
      timestamp: DateTime.now(),
    );
    _messages.add(userMsg);
    _isTyping = true;
    _error = null;
    notifyListeners();

    try {
      // Build conversation history for API
      final history = _messages
          .skip(_messages.length > _historyLimit
              ? _messages.length - _historyLimit
              : 0)
          .map((m) => m.toApiFormat())
          .toList();

      final response = await _dio.post(
        ApiConstants.chatEndpoint,
        data: jsonEncode({
          'model': _selectedModel,
          'message': trimmed,
          'messages': history,
        }),
      );

      final payload = response.data;
      if (payload is Map &&
          payload['success'] == true &&
          payload['data']?['reply'] != null) {
        final botMsg = ChatMessage(
          id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
          text: payload['data']['reply'],
          sender: 'bot',
          timestamp: DateTime.now(),
        );
        _messages.add(botMsg);
      } else {
        throw Exception(payload?['message'] ?? 'Respons tidak valid');
      }
    } on DioException catch (e) {
      String errorText;
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        errorText = 'Koneksi timeout. Pastikan server web sedang berjalan.';
      } else if (e.type == DioExceptionType.connectionError) {
        errorText =
            'Tidak dapat terhubung ke server chatbot. Periksa koneksi jaringan.';
      } else if (e.response?.statusCode == 429) {
        errorText = 'Terlalu banyak permintaan. Coba lagi dalam beberapa saat.';
      } else {
        errorText = 'Gagal memproses jawaban dari AI. (${e.message})';
      }
      _error = errorText;
      _messages.add(ChatMessage(
        id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
        text: 'Maaf, chatbot sedang tidak tersedia. $errorText',
        sender: 'bot',
        timestamp: DateTime.now(),
      ));
    } catch (e) {
      _error = e.toString();
      _messages.add(ChatMessage(
        id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
        text: 'Terjadi kesalahan tak terduga. Silakan coba lagi.',
        sender: 'bot',
        timestamp: DateTime.now(),
      ));
    }

    _isTyping = false;
    notifyListeners();
  }

  // ── Clear history ────────────────────────────────────────
  void clearHistory() {
    _messages = [
      ChatMessage(
        id: 'initial',
        text:
            'Halo! 👋 Saya **Stokku AI**, asisten inventaris cerdas. '
            'Tanyakan soal stok, restock, dead-stock, atau forecast kapan saja.',
        sender: 'bot',
        timestamp: DateTime.now(),
      ),
    ];
    _error = null;
    notifyListeners();
  }
}
