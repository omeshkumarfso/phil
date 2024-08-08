import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  screen,
  act,
} from '@testing-library/react';
import ScanSetView from './ScanSetView';
import { I18nProvider } from '../../../../../i18n';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import _mockData from '../../../../../assets/resources/MockData.json';
import { onToggleSaveComment } from '../../../../../store/actions/MRUserActions';
import thunk from 'redux-thunk';
import commonUtil from '../../../../../services/commonUtil';
import _resources from '../../../../../assets/resources/ProtocolManager.json';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

afterEach(cleanup);
afterEach(() => global.fetch.mockClear());

const middlewares = [thunk];
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    push: jest.fn(),
  }),
}));
const onunload = jest.fn();
Object.defineProperty(window, 'onunload', onunload);

beforeEach(() => {
  sessionStorage.setItem(
    'envVarsObj',
    JSON.stringify({
      oAuthRedirectURL:
        'http://btc5x352.code1.emi.philips.com:8088/openam?goto=http://btc5x352.code1.emi.philips.com/cpmui/',
      applicationDeploymentType: 'onprem',
      applicationRedirectUrl: '/dashboard/protocolAnalytics',
      apiServiceBaseUrl: 'http://btc5x352.code1.emi.philips.com/cpmservices/',
      applicationResourceConfig: 'protocol-analytics.json',
      buildNumber: 'v1.1.0-8a516a05',
      buildDate: '2020-08-11',
      serviceURL: 'http://btc5x352.code1.emi.philips.com/cpmservices/',
      openAMURL: 'http://btc5x352.code1.emi.philips.com:8088/openam',
      openamRedirectURL: '',
    })
  );
});

const setup = (data, selector) => {
  // Mock API
  jest.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({
      status: 200,
      json: () => Promise.resolve(data),
    })
  );

  const mockStore = configureMockStore(middlewares);
  const singleSelection = jest.fn();
  const selectedCheckBoxUpdation = jest.fn();
  let store;
  store = mockStore({
    i18n: {
      locale: 'en',
      translations: { application_title: 'Protocol Manager' },
    },
    mr_user: {
      language: 'en',
      updateBreadCrumbArgs: {
        menu: {
          menu_0: {
            stateData: {
              authorName: 'aiuser',
              examTime: undefined,
              examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
              label: 'Liver Arms up - Extra protocols',
              mainSystemType: 'AWASW_MST_WA15',
              scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
              scannerId: '192.168.28.200',
              scannerIpAddress: null,
              scannerName: undefined,
              softwareVersion: '5.4.1.2',
              updatedDate: undefined,
            },
          },
        },
      },
      renameInfo: _mockData.renameInfo,
    },
    resource: {
      byId: {
        MR: {
          currentView: _resources.MR.currentView,
          ChooseActionTypeList: _resources.MR.ChooseActionTypeList,
          ChooseActionList: _resources.MR.ChooseActionList,
          ActionMapping: _resources.MR.ActionMapping,
          ActionList: _resources.MR.ActionList,
        },
      },
    },
  });
  const props = {
    singleSelection,
    selectedCheckBoxUpdation,
    nodeData: _mockData.mock_data_10,
    datascope: _mockData.mock_data_10,
  };
  const component = render(
      <Provider store={store}>
           <I18nProvider>
        <ScanSetView {...props} />
        </I18nProvider>
      </Provider>
  );
  const input = component.getAllByTestId(selector);
  return {
    input,
    ...component,
  };
};
test('render ScanSetView component', async () => {
  const singleSelection = jest.fn();
  const props = {
    singleSelection,
    nodeData: _mockData.mock_data_10,
    datascope: _mockData.mock_data_10,
  };
  const mockStore = configureMockStore(middlewares);
  let store;
  store = mockStore({
    i18n: {
      locale: 'en',
      translations: { application_title: 'Protocol Manager' },
    },
    mr_user: {
      language: 'en',
      updateBreadCrumbArgs: {
        menu: {
          menu_0: {
            stateData: {
              authorName: 'aiuser',
              examTime: undefined,
              examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
              label: 'Liver Arms up - Extra protocols',
              mainSystemType: 'AWASW_MST_WA15',
              scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
              scannerId: '192.168.28.200',
              scannerIpAddress: null,
              scannerName: undefined,
              softwareVersion: '5.4.1.2',
              updatedDate: undefined,
            },
          },
        },
      },
      renameInfo: _mockData.renameInfo,
    },
    resource: {
      byId: {
        MR: {
          currentView: _resources.MR.currentView,
          ChooseActionTypeList: _resources.MR.ChooseActionTypeList,
          ChooseActionList: _resources.MR.ChooseActionList,
          ActionMapping: _resources.MR.ActionMapping,
          ActionList: _resources.MR.ActionList,
        },
      },
    },
  });
  jest
    .spyOn(global, 'fetch')
    .mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve(_mockData.mock_data_16),
      })
    )
    .mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve(_mockData.mock_data_28),
      })
    );
  const history = createMemoryHistory();
  let stateDataObj = {
    authorName: 'aiuser',
    examTime: undefined,
    examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
    label: 'Liver Arms up - Extra protocols',
    mainSystemType: 'AWASW_MST_WA15',
    scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
    scannerId: '192.168.28.200',
    scannerIpAddress: null,
    scannerName: undefined,
    softwareVersion: '5.4.1.2',
    updatedDate: undefined,
  };
  const location = { stateData: stateDataObj };
  history.push('/', location);
  const component = render(
      <Provider store={store}>
        <Router history={history}>
        <I18nProvider>
          <ScanSetView {...props} />
          </I18nProvider>
        </Router>
      </Provider>
  );
  component.getAllByTestId('scanSetViewPage');
  await commonUtil.flushAllPromises();
});

test('ScanList Checkbox functionality test', async () => {
  const mockStore = configureMockStore(middlewares);
  const singleSelection = jest.fn();
  let store;

  store = mockStore({
    i18n: {
      locale: 'en',
      translations: { application_title: 'Protocol Manager' },
    },
    mr_user: {
      language: 'en',
      updateBreadCrumbArgs: {
        menu: {
          menu_0: {
            stateData: {
              authorName: 'aiuser',
              examTime: undefined,
              examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
              label: 'Liver Arms up - Extra protocols',
              mainSystemType: 'AWASW_MST_WA15',
              scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
              scannerId: '192.168.28.200',
              scannerIpAddress: null,
              scannerName: undefined,
              softwareVersion: '5.4.1.2',
              updatedDate: undefined,
            },
          },
        },
      },
      renameInfo: _mockData.renameInfo,
    },
    resource: {
      byId: {
        MR: {
          currentView: _resources.MR.currentView,
          ChooseActionTypeList: _resources.MR.ChooseActionTypeList,
          ChooseActionList: _resources.MR.ChooseActionList,
          ActionMapping: _resources.MR.ActionMapping,
          ActionList: _resources.MR.ActionList,
        },
      },
    },
  });

  const props = {
    singleSelection,
    nodeData: _mockData.mock_data_10,
    datascope: _mockData.mock_data_10,
  };
  const history = createMemoryHistory();
  let stateDataObj = {
    authorName: 'aiuser',
    examTime: undefined,
    examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
    label: 'Liver Arms up - Extra protocols',
    mainSystemType: 'AWASW_MST_WA15',
    scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
    scannerId: '192.168.28.200',
    scannerIpAddress: null,
    scannerName: undefined,
    softwareVersion: '5.4.1.2',
    updatedDate: undefined,
  };
  const location = { stateData: stateDataObj };
  history.push('/', location);
  const component = render(
      <Provider store={store}>
        <Router history={history}>
        <I18nProvider>
          <ScanSetView {...props} />
          </I18nProvider>
        </Router>
      </Provider>
  );
  await commonUtil.flushAllPromises();
  const input = component.getAllByTestId('selectAllScanSet')[0];
  expect(input).toBeInTheDocument();
  fireEvent.click(input);
  await commonUtil.flushAllPromises();
});
test('ScanSetView SingleSelection functionality test', async () => {
  const mockStore = configureMockStore(middlewares);
  const singleSelection = jest.fn();
  let store;

  store = mockStore({
    i18n: {
      locale: 'en',
      translations: { application_title: 'Protocol Manager' },
    },
    mr_user: {
      language: 'en',
      updateBreadCrumbArgs: {
        menu: {
          menu_0: {
            stateData: {
              authorName: 'aiuser',
              examTime: undefined,
              examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
              label: 'Liver Arms up - Extra protocols',
              mainSystemType: 'AWASW_MST_WA15',
              scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
              scannerId: '192.168.28.200',
              scannerIpAddress: null,
              scannerName: undefined,
              softwareVersion: '5.4.1.2',
              updatedDate: undefined,
            },
          },
        },
      },
      renameInfo: _mockData.renameInfo,
    },
    resource: {
      byId: {
        MR: {
          currentView: _resources.MR.currentView,
          ChooseActionTypeList: _resources.MR.ChooseActionTypeList,
          ChooseActionList: _resources.MR.ChooseActionList,
          ActionMapping: _resources.MR.ActionMapping,
          ActionList: _resources.MR.ActionList,
        },
      },
    },
  });

  const props = {
    singleSelection,
    nodeData: _mockData.mock_data_10,
    datascope: _mockData.mock_data_10,
  };
  const history = createMemoryHistory();
  let stateDataObj = {
    authorName: 'aiuser',
    examTime: undefined,
    examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
    label: 'Liver Arms up - Extra protocols',
    mainSystemType: 'AWASW_MST_WA15',
    scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
    scannerId: '192.168.28.200',
    scannerIpAddress: null,
    scannerName: undefined,
    softwareVersion: '5.4.1.2',
    updatedDate: undefined,
  };
  const location = { stateData: stateDataObj };
  history.push('/', location);
  const component = render(
      <Provider store={store}>
        <Router history={history}>
        <I18nProvider>
          <ScanSetView {...props} />
          </I18nProvider>
        </Router>
      </Provider>
  );
  await commonUtil.flushAllPromises();
  const input = component.getAllByTestId('scanListCheckbox')[0];
  expect(input).toBeInTheDocument();
  fireEvent.click(input, { target: { className: 'ScanListCheckboxIDE' } });
  await commonUtil.flushAllPromises();
});

test('deleteScanSet fucntion test', async () => {
  const mockStore = configureMockStore(middlewares);
  const singleSelection = jest.fn();
  const deleteScanSet = jest.fn();
  let store;
  store = mockStore({
    i18n: {
      locale: 'en',
      translations: { application_title: 'Protocol Manager' },
    },
    mr_user: {
      language: 'en',
      updateBreadCrumbArgs: {
        menu: {
          menu_0: {
            stateData: {
              authorName: 'aiuser',
              examTime: undefined,
              examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
              label: 'Liver Arms up - Extra protocols',
              mainSystemType: 'AWASW_MST_WA15',
              scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
              scannerId: '192.168.28.200',
              scannerIpAddress: null,
              scannerName: undefined,
              softwareVersion: '5.4.1.2',
              updatedDate: undefined,
            },
          },
        },
      },
      renameInfo: _mockData.renameInfo,
    },
    resource: {
      byId: {
        MR: {
          currentView: _resources.MR.currentView,
          ChooseActionTypeList: _resources.MR.ChooseActionTypeList,
          ChooseActionList: _resources.MR.ChooseActionList,
          ActionMapping: _resources.MR.ActionMapping,
          ActionList: _resources.MR.ActionList,
        },
      },
    },
  });
  const props = {
    singleSelection,
    deleteScanSet,
    nodeData: _mockData.mock_data_10,
    datascope: _mockData.mock_data_10,
    optionType: 'SingleSelection',
    ecMetaInfo: { softwareVersion: '5.4' },
  };
  const history = createMemoryHistory();
  let stateDataObj = {
    authorName: 'aiuser',
    examTime: undefined,
    examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
    label: 'Liver Arms up - Extra protocols',
    mainSystemType: 'AWASW_MST_WA15',
    scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
    scannerId: '192.168.28.200',
    scannerIpAddress: null,
    scannerName: undefined,
    softwareVersion: '5.4.1.2',
    updatedDate: undefined,
  };
  const location = { stateData: stateDataObj };
  history.push('/', location);
  const component = render(
      <Provider store={store}>
        <Router history={history}>
        <I18nProvider>
          <ScanSetView {...props} />
          </I18nProvider>
        </Router>
      </Provider>
  );
  await commonUtil.flushAllPromises();
  const input = component.getAllByTestId('scanListCheckbox')[0];
  expect(input).toBeInTheDocument();
  fireEvent.click(input, { target: { className: 'ScanListCheckboxIDE' } });
  await commonUtil.flushAllPromises();
  const input1 = screen.getByTestId('scanOptions');
  expect(input1).toBeInTheDocument();
  await commonUtil.flushAllPromises();
  const scanSetdropdownMenuButton = screen.getByTestId(
    'scanSetdropdownMenuButton'
  );
  fireEvent.click(scanSetdropdownMenuButton);
  fireEvent.mouseUp(input);
  await commonUtil.flushAllPromises();
  const scanOption = screen.getAllByTestId('scan-option')[4];
  fireEvent.click(scanOption);
  await commonUtil.flushAllPromises();
});

test('ScanSet copy paste fucntion test', async () => {
  const mockStore = configureMockStore(middlewares);
  const singleSelection = jest.fn();
  const deleteScanSet = jest.fn();
  let store;
  store = mockStore({
    i18n: {
      locale: 'en',
      translations: { application_title: 'Protocol Manager' },
    },
    mr_user: {
      language: 'en',
      updateBreadCrumbArgs: {
        menu: {
          menu_0: {
            stateData: {
              authorName: 'aiuser',
              examTime: undefined,
              examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
              label: 'Liver Arms up - Extra protocols',
              mainSystemType: 'AWASW_MST_WA15',
              scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
              scannerId: '192.168.28.200',
              scannerIpAddress: null,
              scannerName: undefined,
              softwareVersion: '5.4.1.2',
              updatedDate: undefined,
            },
          },
        },
      },
      renameInfo: _mockData.renameInfo,
    },
    resource: {
      byId: {
        MR: {
          currentView: _resources.MR.currentView,
          ChooseActionTypeList: _resources.MR.ChooseActionTypeList,
          ChooseActionList: _resources.MR.ChooseActionList,
          ActionMapping: _resources.MR.ActionMapping,
          ActionList: _resources.MR.ActionList,
        },
      },
    },
  });

  const props = {
    singleSelection,
    deleteScanSet,
    nodeData: _mockData.mock_data_10,
    datascope: _mockData.mock_data_10,
    optionType: 'SingleSelection',
    ecMetaInfo: { softwareVersion: '5.4' },
  };
  const history = createMemoryHistory();
  let stateDataObj = {
    authorName: 'aiuser',
    examTime: undefined,
    examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
    label: 'Liver Arms up - Extra protocols',
    mainSystemType: 'AWASW_MST_WA15',
    scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
    scannerId: '192.168.28.200',
    scannerIpAddress: null,
    scannerName: undefined,
    softwareVersion: '5.4.1.2',
    updatedDate: undefined,
  };
  const location = { stateData: stateDataObj };
  history.push('/', location);
  const component = render(
      <Provider store={store}>
        <Router history={history}>
        <I18nProvider>
          <ScanSetView {...props} />
          </I18nProvider>
        </Router>
      </Provider>
  );
  await commonUtil.flushAllPromises();
  const input = component.getAllByTestId('scanListCheckbox')[0];
  expect(input).toBeInTheDocument();
  fireEvent.click(input, { target: { className: 'ScanListCheckboxIDE' } });
  await commonUtil.flushAllPromises();
  const input1 = screen.getByTestId('scanOptions');
  expect(input1).toBeInTheDocument();
  await commonUtil.flushAllPromises();
  const scanSetdropdownMenuButton = screen.getByTestId(
    'scanSetdropdownMenuButton'
  );
  fireEvent.click(scanSetdropdownMenuButton);
  fireEvent.mouseUp(input);
  await commonUtil.flushAllPromises();
  const scanCopyOption = screen.getAllByTestId('scan-option')[1];
  fireEvent.click(scanCopyOption);
  const scanPasteOption = screen.getAllByTestId('scan-option')[2];
  fireEvent.click(scanPasteOption);
  await commonUtil.flushAllPromises();
});

test('SaveScanset and SaveComment fucntion test', async () => {
  const mockStore = configureMockStore(middlewares);
  const singleSelection = jest.fn();
  const deleteScanSet = jest.fn();
  const onSaveProtocol = jest.fn();
  let isEdited = true;
  let userComments = 'testdata';
  let store;
  store = mockStore({
    i18n: {
      locale: 'en',
      translations: { application_title: 'Protocol Manager' },
    },
    mr_user: {
      language: 'en',
      updateBreadCrumbArgs: {
        menu: {
          menu_0: {
            stateData: {
              authorName: 'aiuser',
              examTime: undefined,
              examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
              label: 'Liver Arms up - Extra protocols',
              mainSystemType: 'AWASW_MST_WA15',
              scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
              scannerId: '192.168.28.200',
              scannerIpAddress: null,
              scannerName: undefined,
              softwareVersion: '5.4.1.2',
              updatedDate: undefined,
            },
          },
        },
      },
      renameInfo: _mockData.renameInfo,
      toggleSaveComment: true,
      toggleSuccess: true,
      successInfo: {
        header: 'Success',
        content: 'Protocol has beeen saved successfully',
      },
    },
    resource: {
      byId: {
        MR: {
          currentView: _resources.MR.currentView,
          ChooseActionTypeList: _resources.MR.ChooseActionTypeList,
          ChooseActionList: _resources.MR.ChooseActionList,
          ActionMapping: _resources.MR.ActionMapping,
          ActionList: _resources.MR.ActionList,
        },
      },
    },
  });
  const props = {
    singleSelection,
    deleteScanSet,
    nodeData: _mockData.mock_data_10,
    datascope: _mockData.mock_data_10,
    optionType: 'SingleSelection',
    ecMetaInfo: { softwareVersion: '5.4' },
    isEdited: isEdited,
    userComments: userComments,
    onSaveProtocol,
  };
  const history = createMemoryHistory();
  let stateDataObj = {
    authorName: 'aiuser',
    examTime: undefined,
    examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
    label: 'Liver Arms up - Extra protocols',
    mainSystemType: 'AWASW_MST_WA15',
    scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
    scannerId: '192.168.28.200',
    scannerIpAddress: null,
    scannerName: undefined,
    softwareVersion: '5.4.1.2',
    updatedDate: undefined,
  };
  const location = { stateData: stateDataObj };
  history.push('/', location);
  const component = render(
      <Provider store={store}>
        <Router history={history}>
        <I18nProvider>
          <ScanSetView {...props} />
          </I18nProvider>
        </Router>
      </Provider>
  );
  await commonUtil.flushAllPromises();
  const input = component.getAllByTestId('scanListCheckbox')[0];
  expect(input).toBeInTheDocument();
  fireEvent.click(input, { target: { className: 'ScanListCheckboxIDE' } });
  await commonUtil.flushAllPromises();
  const input1 = screen.getByTestId('scanOptions');
  expect(input1).toBeInTheDocument();
  await commonUtil.flushAllPromises();
  const scanSetdropdownMenuButton = screen.getByTestId(
    'scanSetdropdownMenuButton'
  );
  fireEvent.click(scanSetdropdownMenuButton);
  fireEvent.mouseUp(input);
  await commonUtil.flushAllPromises();
  const scanOption = screen.getAllByTestId('scan-option')[4];
  fireEvent.click(scanOption);
  await commonUtil.flushAllPromises();
  const input2 = screen.getByTestId('saveScanset');
  expect(input2).toBeInTheDocument();
  fireEvent.click(input2);
  store.dispatch(onToggleSaveComment(true));
  const input3 = screen.getByTestId('saveProtocol');
  expect(input3).toBeInTheDocument();
  fireEvent.click(input3);
  await commonUtil.flushAllPromises();
});

test('ScanSetView Drag and Drop functionality test', async () => {
  const mockStore = configureMockStore(middlewares);
  const singleSelection = jest.fn();
  let store;

  store = mockStore({
    i18n: {
      locale: 'en',
      translations: { application_title: 'Protocol Manager' },
    },
    mr_user: {
      language: 'en',
      updateBreadCrumbArgs: {
        menu: {
          menu_0: {
            stateData: {
              authorName: 'aiuser',
              examTime: undefined,
              examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
              label: 'Liver Arms up - Extra protocols',
              mainSystemType: 'AWASW_MST_WA15',
              scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
              scannerId: '192.168.28.200',
              scannerIpAddress: null,
              scannerName: undefined,
              softwareVersion: '5.4.1.2',
              updatedDate: undefined,
            },
          },
        },
      },
      renameInfo: _mockData.renameInfo,
    },
    resource: {
      byId: {
        MR: {
          currentView: _resources.MR.currentView,
          ChooseActionTypeList: _resources.MR.ChooseActionTypeList,
          ChooseActionList: _resources.MR.ChooseActionList,
          ActionMapping: _resources.MR.ActionMapping,
          ActionList: _resources.MR.ActionList,
        },
      },
    },
  });

  const props = {
    singleSelection,
    nodeData: _mockData.scanSetData,
    datascope: _mockData.scanSetData,
  };
  const history = createMemoryHistory();
  let stateDataObj = {
    authorName: 'aiuser',
    examTime: undefined,
    examcardGuid: 'e48dc9af-17a9-15bd-3d7c-9495a918398b',
    label: 'Liver Arms up - Extra protocols',
    mainSystemType: 'AWASW_MST_WA15',
    scannerGroupGuid: '33af424c-a597-440f-ba4d-c8a799c4228b',
    scannerId: '192.168.28.200',
    scannerIpAddress: null,
    scannerName: undefined,
    softwareVersion: '5.4.1.2',
    updatedDate: undefined,
  };
  const location = { stateData: stateDataObj };
  history.push('/', location);
  render(
      <Provider store={store}>
        <Router history={history}>
        <I18nProvider>
          <ScanSetView {...props} />
          </I18nProvider>
        </Router>
      </Provider>
  );
  await commonUtil.flushAllPromises();

  const setData = jest.fn();

  const dragBody1 = screen.getAllByTestId('draggableScan_1')[0];

  act(() => {
    fireEvent.dragStart(dragBody1, {
      dataTransfer: { setData: setData, effectAllowed: 'move' },
    });
  });

  await commonUtil.flushAllPromises();

  const dragBody = screen.getAllByTestId('dragBody_1')[0];
  fireEvent.drag(dragBody);

  await commonUtil.flushAllPromises();
  const dragOverBody = screen.getAllByTestId('dragBody_2')[0];
  fireEvent.dragOver(dragOverBody);

  await commonUtil.flushAllPromises();
  const dropBody = screen.getAllByTestId('dragBody_3')[0];
  fireEvent.drop(dropBody);

  await commonUtil.flushAllPromises();
  fireEvent.dragEnd(dragBody);
});
