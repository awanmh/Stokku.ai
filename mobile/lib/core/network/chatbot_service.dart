import 'package:dio/dio.dart';

import '../constants/api_constants.dart';

class ChatbotService {
  ChatbotService._();

  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.chatbotUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 15),
      headers: const {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  static Future<String> ask({
    required String message,
    String model = 'gemini-2.5-flash',
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '',
      data: {'message': message, 'model': model},
    );

    final data = response.data;
    final reply = data?['data'] is Map<String, dynamic>
        ? (data!['data'] as Map<String, dynamic>)['reply']?.toString()
        : null;

    if (reply == null || reply.isEmpty) {
      throw DioException(
        requestOptions: response.requestOptions,
        message: 'Balasan chatbot tidak tersedia.',
        response: response,
      );
    }

    return reply;
  }
}
