/// User model matching backend `domain.User`.
class UserModel {
  final String id;
  final String email;
  final String name;
  final String role; // admin | warehouse_staff | viewer
  final bool isActive;
  final String createdAt;
  final String updatedAt;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] ?? '',
        email: json['email'] ?? '',
        name: json['name'] ?? '',
        role: json['role'] ?? 'viewer',
        isActive: json['is_active'] ?? true,
        createdAt: json['created_at'] ?? '',
        updatedAt: json['updated_at'] ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'role': role,
        'is_active': isActive,
        'created_at': createdAt,
        'updated_at': updatedAt,
      };

  bool get isAdmin => role == 'admin';
  bool get isStaff => role == 'warehouse_staff';
  bool get isViewer => role == 'viewer';
  bool get canWrite => isAdmin || isStaff;
}

/// Auth response from POST /auth/login and POST /auth/register.
class AuthResponse {
  final String token;
  final UserModel user;

  const AuthResponse({required this.token, required this.user});

  factory AuthResponse.fromJson(Map<String, dynamic> json) => AuthResponse(
        token: json['token'] ?? '',
        user: UserModel.fromJson(json['user'] ?? {}),
      );
}
