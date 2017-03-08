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

import React from 'react';
import { mount } from 'enzyme';
import * as history from 'history';

import Wizard from '../../src';

history.createHistory = history.createMemoryHistory;

describe('Wizard', () => {
  let setSteps;
  let step;
  let next;
  let previous;
  let push;
  let go;
  let location;

  describe('without render prop', () => {
    it('should render without steps', () => {
      const mounted = mount(
        <Wizard />,
      );

      expect(mounted).toMatchSnapshot();
    });
  });

  describe('with no other props', () => {
    let mounted;
    const context = {
      history: {
        push: jest.fn(),
      },
    };

    beforeEach(() => {
      mounted = mount(
        <Wizard
          render={({
            _setSteps,
            step: wizardStep,
            next: wizardNext,
            previous: wizardPrevious,
            push: wizardPush,
            go: wizardGo,
          }) => {
            setSteps = _setSteps;
            step = wizardStep;
            next = wizardNext;
            previous = wizardPrevious;
            push = wizardPush;
            go = wizardGo;
            return <noscript />;
          }}
        />,
        { context },
      );

      setSteps([
        { path: 'gryffindor' },
        { path: 'slytherin' },
      ]);
    });

    it('should go to the next and previous steps', () => {
      expect(step).toEqual({ path: 'gryffindor' });
      next();
      expect(step).toEqual({ path: 'slytherin' });
      previous();
      expect(step).toEqual({ path: 'gryffindor' });
    });

    it('should push steps onto the stack', () => {
      expect(step).toEqual({ path: 'gryffindor' });
      push('slytherin');
      expect(step).toEqual({ path: 'slytherin' });
    });

    it('should pull steps off the stack', () => {
      expect(step).toEqual({ path: 'gryffindor' });
      next();
      expect(step).toEqual({ path: 'slytherin' });
      go(-1);
      expect(step).toEqual({ path: 'gryffindor' });
    });

    it('should pass history actions to it\'s parent', () => {
      push('hufflepuff');
      expect(context.history.push).toHaveBeenCalled();
    });

    it('should unlisten on unmount', () => {
      mounted.unmount();
      push('slytherin');
      expect(step.path).toEqual('gryffindor');
    });
  });

  describe('with onNext prop', () => {
    const onNext = jest.fn((onNextStep, onNextSteps, onNextPush) => onNextPush());

    beforeEach(() => {
      mount(
        <Wizard
          onNext={onNext}
          render={({
            _setSteps,
            next: wizardNext,
          }) => {
            setSteps = _setSteps;
            next = wizardNext;
            return <noscript />;
          }}
        />,
      );

      setSteps([
        { path: 'gryffindor' },
        { path: 'slytherin' },
      ]);
    });

    it('should go to the next step and call onNext', () => {
      next();
      expect(onNext).toHaveBeenCalled();
    });
  });

  describe('with routed prop', () => {
    const context = {
      history: {
        push: jest.fn(),
      },
    };

    beforeEach(() => {
      mount(
        <Wizard
          routed
          render={({
            push: wizardPush,
          }) => {
            push = wizardPush;
            return <noscript />;
          }}
        />,
        { context },
      );
    });

    it('should not pass history actions to it\'s parent', () => {
      push('hufflepuff');
      expect(context.history.push).not.toHaveBeenCalled();
    });
  });

  describe('used with a router', () => {
    it('should determine the parent path with react-router v4', () => {
      const context = {
        route: {
          match: {
            url: 'hogwarts',
          },
        },
      };

      mount(
        <Wizard
          routed
          render={({
            _setSteps,
            location: wizardLocation,
          }) => {
            setSteps = _setSteps;
            location = wizardLocation;
            return <noscript />;
          }}
        />,
        { context },
      );

      setSteps([
        { path: 'gryffindor' },
      ]);

      expect(location.pathname).toEqual('hogwarts/gryffindor');
    });

    it('should determine the parent path with react-router v3', () => {
      const context = {
        router: {
          getCurrentLocation: () => ({
            pathname: 'hogwarts',
          }),
          params: {
            splat: '/gryffindor',
          },
        },
      };

      mount(
        <Wizard
          routed
          render={({
            _setSteps,
            location: wizardLocation,
          }) => {
            setSteps = _setSteps;
            location = wizardLocation;
            return <noscript />;
          }}
        />,
        { context },
      );

      setSteps([
        { path: 'gryffindor' },
      ]);

      expect(location.pathname).toEqual('hogwarts/gryffindor');
    });
  });
});
