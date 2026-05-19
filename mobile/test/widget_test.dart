import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:stokku_mobile/app.dart';

void main() {
  testWidgets('StokkuApp smoke test loads splash then login', (tester) async {
    await tester.pumpWidget(const StokkuApp());

    expect(find.byType(StokkuApp), findsOneWidget);
    expect(find.byType(Scaffold), findsOneWidget);
    expect(find.text('stokku.ai'), findsWidgets);
    expect(find.text('Intelligent Inventory Management'), findsOneWidget);
  });
}
