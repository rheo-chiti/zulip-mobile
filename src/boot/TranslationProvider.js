/* @flow strict-local */
import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { IntlProvider } from 'react-intl';
import type { IntlShape } from 'react-intl';

import type { ChildrenArray, GlobalState } from '../types';
import { getSettings } from '../selectors';
import '../../vendor/intl/intl';
import messages from '../i18n/messages';

import '../i18n/locale';

/* eslint-disable react/no-multi-comp */

/**
 * Usually called `_`, and invoked like `_('Message')` -> `'Nachricht'`.
 *
 * Use `context: TranslationContext` in a React component; then in methods,
 * say `const _ = this.context`.
 *
 * @prop intl - The full react-intl API, for more complex situations.
 */
export type GetText = {
  (string): string,
  intl: IntlShape,
};

export const TranslationContext = React.createContext(undefined);

const makeGetText = (intl: IntlShape): GetText => {
  const _ = value => intl.formatMessage({ id: value });
  _.intl = intl;
  return _;
};

/**
 * Consume the old-API context from IntlProvider, and provide a new-API context.
 *
 * This consumes the context provided by react-intl through React's
 * "legacy context API" from before 16.3, and provides a context through the
 * new API.
 *
 * See https://reactjs.org/docs/context.html
 * vs. https://reactjs.org/docs/legacy-context.html .
 */
class TranslationContextTranslator extends PureComponent<{
  children: ChildrenArray<*>,
}> {
  context: { intl: IntlShape };

  static contextTypes = {
    intl: () => null,
  };

  _ = makeGetText(this.context.intl);

  render() {
    return (
      <TranslationContext.Provider value={this._}>
        {this.props.children}
      </TranslationContext.Provider>
    );
  }
}

type Props = {
  locale: string,
  children: ChildrenArray<*>,
};

class TranslationProvider extends PureComponent<Props> {
  props: Props;

  render() {
    const { locale, children } = this.props;

    return (
      /* `IntlProvider` uses React's "legacy context API", deprecated since
       * React 16.3, of which the docs say:
       *
       *   ## Updating Context
       *
       *   Don't do it.
       *
       *   React has an API to update context, but it is fundamentally
       *   broken and you should not use it.
       *
       * To work around that, we set `key={locale}` to force the whole tree
       * to rerender if the locale changes.  Not cheap, but the locale
       * changing is rare.
       */
      <IntlProvider key={locale} locale={locale} textComponent={Text} messages={messages[locale]}>
        <TranslationContextTranslator>{children}</TranslationContextTranslator>
      </IntlProvider>
    );
  }
}

export default connect((state: GlobalState) => ({
  locale: getSettings(state).locale,
}))(TranslationProvider);
