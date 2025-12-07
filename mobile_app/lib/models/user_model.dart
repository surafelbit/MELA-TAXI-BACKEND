class User {
  final String id;
  final String fullName;
  final String phone;
  final String role; // PASSENGER, ADMIN, DRIVER, AGENT, SUPER_ADMIN
  final String? photoUrl;
  final bool? approved;
  
  User({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.role,
    this.photoUrl,
    this.approved,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      fullName: json['fullName'],
      phone: json['phone'],
      role: json['role'],
      photoUrl: json['photoUrl'],
      approved: json['approved'],
    );
  }
}
