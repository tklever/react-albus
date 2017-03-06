/*
 * Copyright (c) 2017 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

import React, { Component, PropTypes } from 'react';
import { createHistory, createMemoryHistory } from 'history';

class Wizard extends Component {
  state = {
    step: {
      path: null,
      name: null,
    },
  }

  getChildContext() {
    return {
      wizard: {
        _setSteps: this.setSteps,
        step: this.state.step,
        steps: this.steps,
        next: this.next,
        previous: this.previous,
        push: this.push,
        go: this.go,
        location: this.location,
      },
    };
  }

  componentWillMount() {
    this.unlisten = this.history.listen((location) => {
      const { action, pathname } = location;
      this.location = location;

      const path = pathname.split('/').pop();
      const step = this.steps.filter(s => s.path === path)[0];
      if (step) {
        this.setState({
          step,
        });
      } else if (!this.props.routed && this.parentHistory[action.toLowerCase()]) {
        this.unlisten();
        this.parentHistory[action.toLowerCase()](pathname);
      }
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  setInitialStep() {
    if (this.props.onNext) {
      this.props.onNext({ path: null, name: null }, this.steps, this.replace);
    } else {
      this.replace();
    }
  }

  setSteps = (steps) => {
    this.steps = steps;
    this.setInitialStep();
  }

  getParentPath() {
    // If we are not routed, parentPath isn't necessary
    if (!this.props.routed) {
      return '';
    }

    const { route, router } = this.context;

    if (route) {
      // If we are using react-router v4, use the match url
      return route.match.url;
    } else if (router) {
      // If we are using react-router v3, use the splat param
      return router.getCurrentLocation().pathname.replace(router.params.splat, '');
    }

    // If we are not within a router, use the basename provided
    return this.props.basename;
  }

  history = this.props.routed ? createHistory() : createMemoryHistory();
  parentHistory = this.context.history;
  parentPath = this.getParentPath();
  forward = true;
  location = this.history.getCurrentLocation();
  steps = [];

  get paths() {
    return this.steps.map(s => s.path);
  }

  fixPath = path => path.replace(/\/\/+/g, '/');

  push = (step) => {
    const nextStep = step || this.paths[this.paths.indexOf(this.state.step.path) + 1];
    this.history.push(this.fixPath(`${this.parentPath}/${nextStep}`));
  }

  replace = (step) => {
    const nextStep = step || this.paths[0];
    this.history.replace(this.fixPath(`${this.parentPath}/${nextStep}`));
  }

  next = () => {
    this.forward = true;
    if (this.props.onNext) {
      this.props.onNext(this.state.step, this.steps, this.push);
    } else {
      this.push();
    }
  }

  previous = () => {
    this.forward = false;
    this.history.goBack();
  }

  go = (amount) => {
    this.forward = amount > 0;
    this.history.go(amount);
  }

  render() {
    if (this.props.render) {
      return this.props.render(this.getChildContext().wizard);
    }
    return <div className={this.props.className}>{this.props.children}</div>;
  }
}

Wizard.propTypes = {
  basename: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  onNext: PropTypes.func,
  routed: PropTypes.bool,
  render: PropTypes.func,
};

Wizard.defaultProps = {
  basename: '',
  children: null,
  className: '',
  onNext: null,
  routed: false,
  render: null,
};

Wizard.contextTypes = {
  router: PropTypes.object,
  route: PropTypes.object,
  history: PropTypes.object,
};

Wizard.childContextTypes = {
  wizard: PropTypes.object,
};

export default Wizard;
