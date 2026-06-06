const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const setupJsPath = path.join(__dirname, '..', 'public', 'js', 'setup.js');

function createMockClassList() {
  const classes = new Set();
  return {
    add: (...items) => items.forEach((item) => classes.add(item)),
    remove: (...items) => items.forEach((item) => classes.delete(item)),
    toggle: (item, force) => {
      if (force === undefined ? !classes.has(item) : force) {
        classes.add(item);
        return true;
      }
      classes.delete(item);
      return false;
    },
    contains: (item) => classes.has(item)
  };
}

function createMockElement(id) {
  return {
    id,
    value: '',
    checked: false,
    disabled: false,
    textContent: '',
    innerHTML: '',
    className: '',
    style: {},
    dataset: {},
    classList: createMockClassList(),
    appendChild: () => {},
    addEventListener: () => {},
    focus: () => {},
    select: () => {},
    setAttribute: () => {},
    removeAttribute: () => {}
  };
}

const elementIds = [
  'setupWizardForm',
  'setupProgressFill',
  'setupStepLabel',
  'adminUsername',
  'adminPassword',
  'confirmPassword',
  'passwordHint',
  'enableMfa',
  'mfaSetupPanel',
  'startMfaSetupBtn',
  'mfaProvisioningBox',
  'setupMfaQrImage',
  'setupMfaSecret',
  'setupMfaCode',
  'confirmMfaCodeBtn',
  'mfaStatusHint',
  'paperlessUrl',
  'paperlessUsername',
  'paperlessToken',
  'testPaperlessBtn',
  'paperlessTestState',
  'fetchMetadataBtn',
  'metadataLoadState',
  'documentsCount',
  'correspondentsCount',
  'tagsCount',
  'scanAllDocuments',
  'includeTag',
  'excludeTagInput',
  'addExcludeTagBtn',
  'excludeTagsContainer',
  'processedTag',
  'excludeProcessedTagBtn',
  'automaticScanEnabled',
  'scanInterval',
  'paperlessTagsDatalist',
  'aiPreset',
  'aiPresetHint',
  'aiProvider',
  'aiApiUrl',
  'aiToken',
  'aiModel',
  'fetchAiModelsBtn',
  'aiValidationTimeout',
  'testAiBtn',
  'aiTestState',
  'mistralOcrEnabled',
  'mistralFields',
  'ocrProvider',
  'ocrApiUrl',
  'ocrApiUrlContainer',
  'ocrApiKeyContainer',
  'ocrApiKey',
  'mistralOcrModel',
  'fetchOcrModelsBtn',
  'ocrValidationTimeout',
  'testOcrBtn',
  'ocrTestState',
  'envPreview',
  'copyEnvPreviewBtn',
  'finalizeSetupBtn',
  'prevStepBtn',
  'nextStepBtn'
];

const elements = new Map(elementIds.map((id) => [id, createMockElement(id)]));

const steps = Array.from({ length: 7 }, (_unused, index) => ({
  dataset: { stepTitle: `Step ${index + 1}` },
  classList: createMockClassList(),
  style: {},
  disabled: false
}));

global.window = {
  __SETUP_BOOTSTRAP__: { config: {}, defaults: {}, aiProviderPresets: [] },
  fetch: async () => ({})
};

global.document = {
  addEventListener: (_event, callback) => callback(),
  querySelectorAll: (selector) => (selector === '.setup-step' ? steps : []),
  querySelector: (selector) => {
    if (selector === 'meta[name="csrf-token"]') {
      return { getAttribute: () => '' };
    }
    return null;
  },
  getElementById: (id) => elements.get(id) || null,
  createElement: (tagName) => createMockElement(tagName)
};

global.Swal = {
  fire: async () => ({ isConfirmed: false }),
  update: () => {}
};

global.navigator = {
  clipboard: {
    writeText: async () => {}
  }
};

global.Headers = class Headers {};
global.setInterval = () => 1;
global.clearInterval = () => {};

const source = fs.readFileSync(setupJsPath, 'utf8');
vm.runInThisContext(source, { filename: setupJsPath });

assert.ok(window.setupWizard, 'Setup wizard should initialize');
assert.strictEqual(window.setupWizard.scanAllDocuments.checked, false, 'Fresh setup should default to include-tag mode');
assert.strictEqual(window.setupWizard.includeTag.disabled, false, 'Include tag input should stay enabled by default');

console.log('✅ test-setup-wizard-tag-default passed');