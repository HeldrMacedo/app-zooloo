const { withAndroidStyles, AndroidConfig } = require('@expo/config-plugins');

const { assignStylesValue, getAppThemeGroup } = AndroidConfig.Styles;

/**
 * Ajusta o AppTheme nativo para bater com o visual do app.
 *
 * Feito como config plugin (e não editando android/app/src/main/res/values/styles.xml
 * na mão) porque o diretório android/ é regenerado por `expo prebuild`.
 *
 * O que corrige:
 * - `android:statusBarColor` vinha como #ffffff, contradizendo o SYSTEM_BAR_COLOR
 *   azul pintado pelo componente Screen. Sob edge-to-edge o Android 15+ ignora
 *   essa chave, mas de Android 10 a 14 ela pintava a status bar de branco por cima
 *   da faixa azul.
 * - `android:enforceNavigationBarContrast` desenhava um scrim próprio sobre a
 *   faixa azul do TabBarBackground.
 * - O parent DayNight aplicava tema escuro do sistema num app que só tem cores
 *   claras definidas (mesma razão do userInterfaceStyle: "light" no app.json).
 */
const withZoolooAndroidTheme = (config) =>
  withAndroidStyles(config, (mod) => {
    mod.modResults = assignStylesValue(mod.modResults, {
      add: false,
      parent: getAppThemeGroup(),
      name: 'android:statusBarColor',
      value: '',
    });

    mod.modResults = assignStylesValue(mod.modResults, {
      add: true,
      parent: getAppThemeGroup(),
      name: 'android:enforceNavigationBarContrast',
      value: 'false',
    });

    mod.modResults.resources.style = mod.modResults.resources.style.map((style) => {
      if (style.$.name === 'AppTheme') {
        style.$.parent = 'Theme.AppCompat.Light.NoActionBar';
      }
      return style;
    });

    return mod;
  });

module.exports = withZoolooAndroidTheme;
