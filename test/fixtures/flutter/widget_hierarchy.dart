import 'package:flutter/material.dart';

/// Complex widget hierarchy for testing
class ParentWidget extends StatefulWidget {
  const ParentWidget({Key? key}) : super(key: key);

  @override
  State<ParentWidget> createState() => _ParentWidgetState();
}

class _ParentWidgetState extends State<ParentWidget> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ChildWidget(),
        AnotherChildWidget(),
      ],
    );
  }

  void parentMethod() {
    print('Parent method');
  }
}

class ChildWidget extends StatelessWidget {
  const ChildWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: NestedWidget(),
    );
  }

  void childMethod() {
    print('Child method');
  }
}

class NestedWidget extends StatelessWidget {
  const NestedWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Text('Nested Widget');
  }

  void nestedMethod() {
    print('Nested method');
  }
}

class AnotherChildWidget extends StatelessWidget {
  const AnotherChildWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Text('Another Child');
  }
}
