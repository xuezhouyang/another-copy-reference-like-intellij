import 'package:flutter/material.dart';

/// A stateful widget with state management
class CounterWidget extends StatefulWidget {
  final int initialValue;

  const CounterWidget({
    Key? key,
    this.initialValue = 0,
  }) : super(key: key);

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  late int _counter;

  @override
  void initState() {
    super.initState();
    _counter = widget.initialValue;
  }

  void _increment() {
    setState(() {
      _counter++;
    });
  }

  void _decrement() {
    setState(() {
      _counter--;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Counter: $_counter'),
        Row(
          children: [
            IconButton(
              icon: Icon(Icons.add),
              onPressed: _increment,
            ),
            IconButton(
              icon: Icon(Icons.remove),
              onPressed: _decrement,
            ),
          ],
        ),
      ],
    );
  }
}

/// Another stateful widget example
class ToggleSwitch extends StatefulWidget {
  const ToggleSwitch({Key? key}) : super(key: key);

  @override
  State<ToggleSwitch> createState() => _ToggleSwitchState();
}

class _ToggleSwitchState extends State<ToggleSwitch> {
  bool _isOn = false;

  void _toggle() {
    setState(() {
      _isOn = !_isOn;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Switch(
      value: _isOn,
      onChanged: (value) => _toggle(),
    );
  }
}
