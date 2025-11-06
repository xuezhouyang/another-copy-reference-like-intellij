import 'package:flutter/material.dart';

/// A simple stateless widget example
class MyButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;

  const MyButton({
    Key? key,
    required this.label,
    required this.onPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(label),
    );
  }

  void _handleTap() {
    print('Button tapped');
  }
}

/// Another stateless widget
class CustomCard extends StatelessWidget {
  const CustomCard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text('Custom Card'),
      ),
    );
  }
}
