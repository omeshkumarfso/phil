import React, { Fragment, useEffect, useState } from 'react';
import './ScanSetView.css';
import appSettings from './../../../../../app.settings';
import { translate } from '../../../../../i18n';
import globalHelperService from '../../../../../services/globalHelperService';
import scansetService from '../../../../../services/scanset.service';
import errorHandlingService from '../../../../../services/errorHandling.service';
import protocolService from '../../../../../services/protocolView.service';
import translateText from '../../../../../i18n/translateText';
import { connect } from 'react-redux';
import {
  onToggleError,
  onError,
  checkIsEdited,
  TriggerBreadCrumbChangeEvent,
  onToggleConfirmDialogue,
  onConfirmWarning,
  onToggleSaveComment,
  onToggleSuccess,
  onSuccess,
  onEmitScan,
  onSelectedScansetCollectionList,
} from '../../../../../store/actions/MRUserActions';
import ProtocolFolderViewService from '../../../../../services/folderView.service';
import clockIcon from '../../../../../assets/images/ux-images/svg/clock.svg';
import UseSpinnerHooks from '../../../../Hooks/UseSpinnerHooks';
import SVG from 'react-inlinesvg';
import MRTooltip from '../../../../Utils/ToolTip/MRTooltip';
import ScanList from './ScanList';
import ToggleIconImageRight from '../../../../../assets/images/ux-images/ic-arrowRight-blue.png';
import ToggleIconImageLeft from '../../../../../assets/images/ux-images/ic-arrowLeft-blue.png';
import ScanOptions from './ScanOptions/ScanOptions';
import ProtocolPromptBar from '../../ProtocolPromptBar';
import { useHistory } from 'react-router-dom';
import SaveComment from './SaveComment/SaveComment';
import SuccessDialogueView from '../../../../../components/ProtocolManager/SuccessDialogue/SuccessDialogueView';
import _ from 'lodash';
import parse from 'html-react-parser';
import ProtocolInfo from './ProtocolInfo/ProtocolInfo';

const ScanSetView = (props) => {
  const history = useHistory();

  const {
    transObj,
    onToggleError,
    onError,
    checkIsEdited,
    TriggerBreadCrumbChangeEvent,
    onToggleConfirmDialogue,
    onConfirmWarning,
    stateData,
    onToggleSaveComment,
    onToggleSuccess,
    onSuccess,
    toggleSaveComment,
    successInfo,
    toggleSuccess,
    renameInfo,
    onEmitScan,
    modality,
    selectedScansetCollection,
    onSelectedScansetCollectionList,
    tabSelection,
    selectedRepoFromProtocolPage,
  } = props;
  const [ecMetaInf, setEcMetaInf] = useState({});
  const [scanSetCol, setScanSetCollection] = useState({});
  const [versionInfoData, setVersionInfoData] = useState([]);
  const [spinner, showSpinner, hideSpinner] = UseSpinnerHooks();
  const [helpInfoUrl, sethelpInfoUrl] = useState('');
  const [helpInfoStatus, setHelpInfoStatus] = useState('Loading');
  const [chooseActionOptionType, updateChooseActionOptionType] =
    useState('ScanSetIntial');
  const [updateOption, setUpdateOption] = useState('onLoad');
  const [helpLaunchUrl, sethelpLaunchUrl] = useState('');
  const [istoggleSelection, setToggleSelection] = useState(false);
  const toggleRightPanel = () => {
    setToggleSelection(!istoggleSelection);
  };
  const [selectedAll, setSelectedAll] = useState(false);
  const [scannerId, setScannerId] = useState(undefined);
  const [examcardGuid, setExamcardGuid] = useState(undefined);
  const [percentage, setPercentage] = useState(0);
  const [progressContent, setProgressContent] = useState(undefined);
  const [isOpenPromptmodal, setOpenPromptModal] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [enablePasteOption, setEnablePasteOption] = useState(undefined);
  const [displayCommentOverlay, setDisplayCommentOverlay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onSaveProtocolResponse, setOnSaveProtocolResponse] = useState({});
  const [isOpenCommentmodal, setOpenCommentModal] = useState(false);
  const [currentData, setCurrentData] = useState(
    history && history.location.state ? history.location.state.stateData : ''
  );
  const [scanSetcollectionKeys, setScanSetcollectionKeys] = useState([]);
  const [draggIndex, setDraggIndex] = useState([]);
  const [draggingGroup, setDraggingGroup] = useState({});
  const [droppingGroup, setDroppingGroup] = useState({});
  const [isDraggableFlag, setIsDraggableFlag] = useState(false);
  const [uiCheckBoxArray, setUiCheckBoxArray] = useState([]);
  const [nonConsecutiveFlag, setNonConsecutiveFlag] = useState(false);
  const [showToolTip, setShowToolTip] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [renameGroupKey, setRenameGroupKey] = useState('');
  const [editGeometry, setGeometry] = useState('geometry');
  const [editGeometryLink, setEditGeometryLink] = useState('geometryLink');
  const [isEditScanSet, setIsEditScanSet] = useState(false);

  let ecMetaInfo = {};
  let exeItemList = {};
  let examCardDetails = {};
  var scanSetCollection = {};
  let selectedScanSetsCount = 0;
  let selectedKey = 0;
  var singleSelectScanSetCollection = {};
  let reOrderNodes = [];
  let scanReOrderIndex = 0;
  let deleteNodeIndex;
  let copyPasteNodeIndex;
  let tooltipOndrag;

  useEffect(() => {
    onLoadScanSetController();

    window.onbeforeunload = function (event) {
      sessionStorage.setItem('examcardGuid', currentData.examcardGuid);
      sessionStorage.setItem('scannerId', currentData.scannerId);
      sessionStorage.setItem(
        'ActiveSessionId',
        sessionStorage.getItem('SessionId')
      );

      let contentEdit = sessionStorage.getItem('isContentEdited');

      if (contentEdit === 'true') {
        event.returnValue = translate('LEAVING_PAGE_WARNING');
      }
    };

    window.onunload = function () {
      if (currentData) {
        protocolService.unloadprotocol(currentData);
      } else {
        protocolService.unloadprotocol({
          examcardGuid: sessionStorage.getItem('examcardGuid'),
          scannerId: sessionStorage.getItem('scannerId'),
        });
      }
    };

    return () => {
      if (
        history &&
        (history.location.pathname ===
          `/protocolmanager/${modality}/protocol/M12` ||
          history.location.pathname ===
                    `/protocolmanager/${modality}/Reports/UserReports` ||
          history.location.pathname ===
                              `/protocolmanager/service-tool/users` ||
          history.location.pathname ===
            `/protocolmanager/${modality}/scanner/M13` ||
          history.location.pathname === '/protocolmanager')
      ) {
        sessionStorage.removeItem('ActiveExamcard');

        if (currentData) {
          setTimeout(() => {
            protocolService.unloadprotocol(currentData);
          }, 100);
        } else {
          setTimeout(() => {
            protocolService.unloadprotocol({
              examcardGuid: sessionStorage.getItem('examcardGuid'),
              scannerId: sessionStorage.getItem('scannerId'),
            });
          }, 100);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (
      renameInfo &&
      renameInfo['chooseScanSet'] !== '' &&
      renameInfo['renameScanSet'].name &&
      renameInfo['renameScanSet'].name !== ''
    ) {
      OnRenameScanSet(renameInfo['renameScanSet']);
    }
  }, [renameInfo['chooseScanSet'], renameInfo['renameScanSet']]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, false);
    return () => {
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, [selectedScansetCollection]);

  const handleClickOutside = (e) => {
    if (
      e.target.className !== 'choose-action-btn' &&
      e.target.className !== 'rename'
    ) {
      let tempScanSetObj = _.cloneDeep(selectedScansetCollection);
      for (var group in tempScanSetObj) {
        tempScanSetObj[group].excecutionList[
          Object.keys(tempScanSetObj[group].excecutionList)[0]
        ].isEditMode = false;
        for (var executionItemIndex in tempScanSetObj[group].excecutionList) {
          tempScanSetObj[group].excecutionList[
            executionItemIndex
          ].isEditMode = false;
        }
        setScanSetCollection(tempScanSetObj);
        onSelectedScansetCollectionList(tempScanSetObj);
        if(sessionStorage.getItem('isContentEdited')==='true' ){
        sessionStorage.setItem('isContentEdited', 'true');
      }
    else{sessionStorage.setItem('isContentEdited', 'false');}
  }
    }
  };

  const OnRenameScanSet = (scanObject) => {
    try {
      let tempScanSetObj = _.cloneDeep(scanSetCol);
      let selectedScanSetToRename = renameInfo['renameScanSet'];
      if (renameGroupKey !== '') {
        for (var group in tempScanSetObj) {
          tempScanSetObj[group].excecutionList[
            Object.keys(tempScanSetObj[group].excecutionList)[0]
          ].isEditMode = false;
          for (var executionItemIndex in tempScanSetObj[group].excecutionList) {
            tempScanSetObj[group].excecutionList[
              executionItemIndex
            ].isEditMode = false;
          }
        }
        tempScanSetObj[renameGroupKey].excecutionList[
          selectedScanSetToRename.self
        ].isEditMode = true;
        sessionStorage.setItem('isContentEdited', 'true');
     
         setScanSetCollection(tempScanSetObj);
        onSelectedScansetCollectionList(tempScanSetObj);
      }
    } catch (ex) {
      let message = errorHandlingService.getErrorMessage(
        transObj,
        'MESSAGE_ERROR_GENERAL_RETRY_CONTACT_ADMIN',
        '',
        '10087'
      );
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: message,
      });
    }
  };
  const onLoadScanSetController = () => {
    try {
      showSpinner();
      var renderScanSetData = function (res) {
        let errorInfo = errorHandlingService.checkForError(transObj, res);
        let tempecMetaInfo =
          Object.keys(ecMetaInfo).length > 0
            ? ecMetaInfo
            : _.cloneDeep(ecMetaInf);
        if (!errorInfo.status) {
          resetScanSetData();
          examCardDetails = res;
          // update total time with response examDuration
          tempecMetaInfo.time = globalHelperService.getMinutesSeconds(
            examCardDetails.examDuration
          );
          scansetService.formatScanSetData(
            res.executionItemList,
            scanSetCollection
          );
          if (updateOption === 'onLoad') {
            loadExamCardMetaDetails();
          }
          setLoading(true);
          if (sessionStorage.getItem('isContentEdited')) {
            let edited =
              sessionStorage.getItem('isContentEdited') === 'true'
                ? true
                : false;
            setIsEdited(edited);
            checkIsEdited(edited);
          }
          setEcMetaInf(tempecMetaInfo);
          setScanSetCollection(scanSetCollection);
          onSelectedScansetCollectionList(scanSetCollection);
        } else {
          onToggleError(true);
          onError({
            header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
            content: errorInfo.message,
          });
          hideSpinner();
        }
      };
      if (currentData) {
        setScannerId(currentData.scannerId);
        setExamcardGuid(currentData.examcardGuid);
        /*$log.debug('ScansetCtrl-readScanSetInfo-Api Reuested time:' + GlobalHelperService.currentDateTime().time + $state.params.currentData.label);*/
        protocolService.readScanSetInfo(
          {
            examcardGuid: currentData.examcardGuid,
            scannerId: currentData.scannerId,
          },
          renderScanSetData
        );
        onLoadHelpInfo();
      }
    } catch (ex) {
      let message = errorHandlingService.getErrorMessage(
        transObj,
        'MESSAGE_ERROR_GENERAL_RETRY_CONTACT_ADMIN',
        '',
        '10092'
      );
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: message,
      });
      hideSpinner();
    }
  };

  const resetScanSetData = () => {
    try {
      examCardDetails = {};
      scanSetCollection = {};
      setScanSetCollection({});
      onSelectedScansetCollectionList({});
    } catch (ex) {
      throw ex;
    }
  };

  const loadExamCardMetaDetails = () => {
    try {
      var formatExamCardMetaDetails = function (res) {
        var errorInfo = errorHandlingService.checkForError(transObj, res);
        if (!errorInfo.status) {
          ecMetaInfo.name = res.name;
          ecMetaInfo.groupGUID = res.groupGuid;
          //+ $translate.instant("LABEL_MINUTE_1");
          ecMetaInfo.time = globalHelperService.getMinutesSeconds(
            examCardDetails.examDuration
          );
          if (res.groupName !== null || res.scannerName !== null) {
            ecMetaInfo.systemType = res.groupName || res.scannerName;
          }
          ecMetaInfo.groupLabel =
            res.groupName !== null
              ? translateText.getTranslatedText(transObj, 'LABEL_SYSTEM_TYPE')
              : translateText.getTranslatedText(transObj, 'LABEL_SCANNER_NAME');
          ecMetaInfo.pathway = res.path;
          ecMetaInfo.parentGuid = res.parentGuid;
          ecMetaInfo.timestamp = new Date(
            res.versionInfoList[0].lastUpdatedDateTime
          )
            .toISOString()
            .replace('Z', '')
            .replace('T', ' ');
          ecMetaInfo.softwareVersion = res.softwareVersion;
          ecMetaInfo.versionInfo = [];
          for (var index = 0; index < res.versionInfoList.length; index++) {
            ecMetaInfo.versionInfo.push(res.versionInfoList[index]);
            ecMetaInfo.versionInfo[index].modifiedOn =
              globalHelperService.convertToReadableTime(
                res.versionInfoList[index].lastUpdatedDateTime,
                transObj
              );
            ecMetaInfo.versionInfo[index].modifiedBy =
              res.versionInfoList[index].userName;
          }
          ecMetaInfo.modifiedOn = ecMetaInfo.versionInfo[0].modifiedOn;
          ecMetaInfo.modifiedBy = ecMetaInfo.versionInfo[0].modifiedBy;
          ecMetaInfo.userComments = ecMetaInfo.versionInfo[0].userComments;
          ecMetaInfo.systemComments = ecMetaInfo.versionInfo[0].systemComments;
          /* Update the action menu for updating add scan option based on the version */
          updateDropdownOptions('ScanSetIntial');
          setVersionInfoData(ecMetaInfo.versionInfo);
          setEcMetaInf(ecMetaInfo);
          hideSpinner();
        } else {
          onToggleError(true);
          onError({
            header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
            content: errorInfo.message,
          });
          hideSpinner();
        }
      };
      protocolService.getExamCardDetails(
        currentData.examcardGuid,
        formatExamCardMetaDetails
      );
    } catch (ex) {
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: ex.message,
      });
    }
  };

  const onLoadHelpInfo = () => {
    protocolService.readHelpInfoUniqueId(
      {
        examcardGuid: currentData.examcardGuid,
        scannerId: currentData.scannerId,
      },
      renderHelpInfo,
      'protocol'
    );
  };

  const renderVersionInfo = () => {
    return Object.entries(versionInfoData).map(([key, value]) => {
      return (
        <tr className='version-control-tr-tbody' key={key}>
          <td className='modified-on-tbody'>{versionInfoData[key].version}</td>
          <td className='modified-on-tbody'>
            {versionInfoData[key].modifiedOn}
          </td>
          <td className='modified-by-tbody'>
            {versionInfoData[key].modifiedBy}
          </td>
          <td className='comments-tbody'>
            <p className='version-control-p'>
              {versionInfoData[key].userComments}
            </p>
            <p>{versionInfoData[key].systemComments}</p>
          </td>
        </tr>
      );
    });
  };

  const renderHelpInfo = function (res) {
    try {
      let errorInfo = errorHandlingService.checkForError(transObj, res);
      let infourl = '';
      let launchurl = '';
      let infostatus = protocolService.statusType.loading;
      if (errorInfo.status) {
        setLoading(true);
        infostatus = protocolService.statusType.failed;
      } else {
        if (res && res.helpInfoKey) {
          infourl = protocolService.getHelpInfoUrl(currentData, res);
          infostatus = protocolService.statusType.completed;
          launchurl = protocolService.getHelpLaunchURL();
          sethelpLaunchUrl(launchurl);
          sethelpInfoUrl(infourl);
          setHelpInfoStatus(infostatus);
        } else {
          infostatus = protocolService.statusType.nohelpinfo;
          setHelpInfoStatus(infostatus);
        }
      }
    } catch (ex) {
      let infostatus = protocolService.statusType.failed;
      setHelpInfoStatus(infostatus);
    }
  };
  const onRetryHelpInfo = function () {
    try {
      console.log('ScansetCtrl-onRetryHelpInfo- Function begin invoking.');
      let infostatus = protocolService.statusType.loading;
      setHelpInfoStatus(infostatus);
      onLoadHelpInfo();
    } catch (ex) {
      let infostatus = protocolService.statusType.failed;
      setHelpInfoStatus(infostatus);
      onToggleError(true);
      onError({
        header: '10076',
        content: translate.getTranslatedText(
          transObj,
          'MESSAGE_ERROR_GENERAL_RETRY_CONTACT_ADMIN'
        ),
      });
    }
  };

  const getTargetScanSetID = function () {
    var scanGroupKeyList = Object.keys(scanSetCol);
    var tagetGroupKey = scanGroupKeyList[scanGroupKeyList.length - 1];
    var targetScanUniqueID = tagetGroupKey
      ? scanSetCol[tagetGroupKey].uniqueId
      : null;
    return targetScanUniqueID;
  };

  const updateScanList = function (args) {
    reloadChooseAction({
      pasteItems: 'retainPaste',
      reloadScasets: 'yes',
      isContentEdited: true,
    });
  };

  const reloadChooseAction = function (res) {
    try {
      if (res.isContentEdited !== '') {
        sessionStorage.setItem('isContentEdited', res.isContentEdited);
      }
      if (res.pasteItems !== 'retainPaste') {
        sessionStorage.removeItem('copiedScanSet_data');
      }
      if (res.reloadScasets === 'yes') {
        setLoading(false);
        onLoadScanSetController();
      }
      updateDropdownOptions('ScanSetIntial');
      setSelectedAll(false);
      var selectAllcheckbox = document.getElementById('allScanSet');
      selectAllcheckbox.indeterminate = false;
      setTimeout(() => {
        hideSpinner();
      }, 500);
    } catch (ex) {
      throw ex;
    }
  };

  const singleSelection = (event, scan) => {
    singleSelectScanSetCollection = _.cloneDeep(scanSetCol);
    if (
      event.target.className !== 'name scan-name' &&
      event.target.className !== 'scan-geoname' &&
      event.target.className !== 'scan-geolink'
    ) {
      for (var group in singleSelectScanSetCollection) {
        singleSelectScanSetCollection[group].excecutionList[
          Object.keys(singleSelectScanSetCollection[group].excecutionList)[0]
        ].isEditMode = false;
        for (var executionItemIndex in singleSelectScanSetCollection[group]
          .excecutionList) {
          singleSelectScanSetCollection[group].excecutionList[
            executionItemIndex
          ].isEditMode = false;
        }
      }
    }
    if (
      event.target.className !== 'scanListCheckbox' &&
      event.target.className !== 'checkboxEle'
    ) {
      setSelectedAll(false);

      selectedCheckBoxUpdation(event, 'unSelectAll');
      if (scan.isGrouppedScan === true) {
        updateDropdownOptions('GroupedScanset');
        if (isSingleScan()) {
          updateDropdownOptions('SingleGroupScanSet');
        }
      } else {
        if (isSingleScan()) {
          updateOptionsForSingleScan();
        } else {
          updateDropdownOptions('SingleSelection');
        }
      }
      singleSelectScanSetCollection[scan.parentKey].isSelected = true;
    }

    setScanSetCollection(singleSelectScanSetCollection);
    onSelectedScansetCollectionList(singleSelectScanSetCollection);
  };
  const isSingleScan = () => {
    var scansetCollection = Object.keys(scanSetCol);
    var returnValue = false;
    if (scansetCollection.length === 1) {
      returnValue = true;
    }
    return returnValue;
  };

  const updateOptionsForSingleScan = () => {
    var singleScanGroup = Object.keys(scanSetCol)[0];
    var executionListCount =
      scanSetCol[singleScanGroup].executionItemList.length;

    if (executionListCount === 1) {
      updateDropdownOptions('SingleScanSet');
    } else if (executionListCount > 1) {
      updateDropdownOptions('SingleGroupScanSet');
    }
  };
  const selectedCheckBoxUpdation = (event, scan) => {
    try {
      //$this.hideContextMenu();
      console.log(
        'ScansetCtrl-selectedCheckBoxUpdation-function has been initialized.'
      );
      selectedScanSetsCount = 0;
      let selectAllcheckbox = document.getElementById('allScanSet');
      scanSetCollection =
        scan === 'unSelectAll'
          ? singleSelectScanSetCollection
          : _.cloneDeep(scanSetCol);
      if (scan.parentKey) {
        var scansetObj = scanSetCollection[scan.parentKey];
        scansetObj.isDraggable = scansetObj.checkBoxSelected;
      }
      for (var key in scanSetCollection) {
        scanSetCollection[key].isSelected = false;
        var scanSetObj = scanSetCollection[key];
        if (scan === 'selectAll') {
          scanSetObj.checkBoxSelected =
            document.getElementById('allScanSet').checked;
          scanSetObj.isDraggable = scanSetObj.checkBoxSelected;
        }
        if (scan === 'unSelectAll') {
          scanSetObj.checkBoxSelected = false;
          scanSetObj.isDraggable = scanSetObj.checkBoxSelected;
        }
        if (scanSetObj.checkBoxSelected === true) {
          selectedScanSetsCount++;
          if (selectedScanSetsCount === 1) {
            selectedKey = key;
          }
          scanSetObj.isSelected = false;
        }
      }
      scanSetCollection[key] = scanSetObj;
      setScanSetCollection(scanSetCollection);
      onSelectedScansetCollectionList(scanSetCollection);
      checkBoxBehaviour(selectAllcheckbox);
    } catch (ex) {
      onToggleError(true);
      onError({ header: 'Error', content: ex.message });
      throw ex;
    }
  };
  const checkBoxBehaviour = (selectAllcheckbox) => {
    try {
      console.log(
        'ScansetCtrl-checkBoxBehaviour-checkBoxBehaviour function has been initialized.'
      );
      var updateOption, totalScanSetsCount;
      totalScanSetsCount = Object.keys(scanSetCol).length;
      if (selectedScanSetsCount === 0) {
        setSelectedAll(false);
        updateOption = 'ScanSetIntial';
        selectAllcheckbox.indeterminate = false;
      } else if (selectedScanSetsCount < totalScanSetsCount) {
        selectAllcheckbox.indeterminate = true;
        updateOption = multipleScans(selectAllcheckbox);
      } else if (selectedScanSetsCount === totalScanSetsCount) {
        setSelectedAll(true);
        selectAllcheckbox.indeterminate = false;

        if (totalScanSetsCount === 1) {
          var singleScanGroup = Object.keys(scanSetCol)[0];
          var executionListCount =
            scanSetCol[singleScanGroup].executionItemList.length;

          if (executionListCount === 1) {
            updateOption = 'SingleScanSet';
          } else if (executionListCount > 1) {
            updateOption = 'SingleGroupScanSet';
          }
        } else {
          updateOption = 'AllSelect';
        }
      }
      setUpdateOption(updateOption);
      updateDropdownOptions(updateOption);
      setEnablePasteOption(undefined);
    } catch (ex) {
      onToggleError(true);
      onError({ header: 'Error', content: ex.message });
    }
    console.info('ScansetCtrl-checkBoxBehaviour-function execution ended');
  };
  const multipleScans = (selectAllcheckbox) => {
    try {
      console.log(
        'ScansetCtrl-multipleScans-multipleScans function has been initialized.'
      );
      selectAllcheckbox.indeterminate = true;
      var updateOption;
      let scanSetCollection = scanSetCol;
      var executionListCount =
        scanSetCollection[selectedKey].executionItemList.length;
      if (selectedScanSetsCount === 1) {
        if (executionListCount === 1) {
          updateOption = 'SingleSelection';
        } else if (executionListCount > 1) {
          updateOption = 'GroupedScanset';
        }
      } else {
        if (selectedScanSetsCount > 1) {
          if (Object.keys(scanSetCollection).length !== selectedScanSetsCount) {
            updateOption = 'MultiSelect';
            setSelectedAll(false);
          }
        }
      }
      console.log('ScansetCtrl-multipleScans-function execution ended');
      return updateOption;
    } catch (ex) {
      onToggleError(true);
      onError({ header: 'Error', content: ex.message });
    }
  };

  const updateDropdownOptions = function (updateOption) {
    try {
      if (
        selectedRepoFromProtocolPage === appSettings.RESPOSITORY_TYPE.REFERENCE
      ) {
        updateChooseActionOptionType('ScanSetNull');
      } else {
        updateChooseActionOptionType(updateOption);
      }
    } catch (ex) {}
  };

  const formatData = function (scanDetails) {
    try {
      return {
        type: scanDetails.type,
        uniqueId: scanDetails.uniqueId,
        name: scanDetails.name,
        lastUpdateName: scanDetails.name,
        executionItemList: scanDetails.executionItemList,
        outputDescriptionList: [],
        dataType: scanDetails.dataType,
        editMode: scanDetails.editMode,
      };
    } catch (ex) {
      throw ex;
    }
  };

  const getSelectedScanSets = function () {
    try {
      var multiSelectedScanSets = [];
      var data;
      for (var key in scanSetCol) {
        if (scanSetCol.hasOwnProperty(key)) {
          if (scanSetCol[key].hasOwnProperty('checkBoxSelected')) {
            if (scanSetCol[key].checkBoxSelected === true) {
              data = formatData(scanSetCol[key]);
              multiSelectedScanSets.push(data);
            } else if (scanSetCol[key].isSelected === true) {
              data = formatData(scanSetCol[key]);
              multiSelectedScanSets.push(data);
            }
          }
        }
      }
      return multiSelectedScanSets;
    } catch (ex) {
      throw ex;
    }
  };

  const copyScanSet = function () {
    try {
      var multiSelectCollection = getSelectedScanSets();
      if (multiSelectCollection) {
        sessionStorage.setItem(
          'copiedScanSet_data',
          JSON.stringify(multiSelectCollection)
        );
      }

      updateDropdownOptions(updateOption);
      setEnablePasteOption(updateOption);
    } catch (ex) {}
  };

  const hideContextMenu = () => {
    //try {
    //     var contextMenu = angular.element(document.querySelector('.open'));
    //     if (contextMenu) {
    //         contextMenu.removeClass('open');
    //     }
    // } catch (ex) {
    //     $log.error('ScansetCtrl-hideContextMenu-error occured in hideContextMenu' + ex.message);
    //     throw ex;
    // }
  };

  const getGroupKey = function (node) {
    try {
      var nodeValue = Object.keys(node).map(function (e) {
        return node[e];
      });
      return nodeValue[0].groupKey;
    } catch (ex) {
      throw ex;
    }
  };

  const updateUIDraggableScans = function () {
    try {
      let _uiCheckBoxArray = [];
      for (var key in scanSetCol) {
        if (scanSetCol.hasOwnProperty(key)) {
          if (scanSetCol[key].checkBoxSelected === true) {
            _uiCheckBoxArray.push(key);
          }
        }
      }
      setUiCheckBoxArray(_uiCheckBoxArray);
      return _uiCheckBoxArray;
    } catch (ex) {
      throw ex;
    }
  };

  const checkConsecutive = function (checkboxChecked) {
    try {
      var counter = 0;
      for (var j = 0; j <= checkboxChecked.length - 2; j++) {
        var difference =
          Object.keys(scanSetCol).indexOf(checkboxChecked[j + 1]) -
          Object.keys(scanSetCol).indexOf(checkboxChecked[j]);
        if (difference !== 1) {
          counter++;
        }
      }
      if (counter === 0) {
        setNonConsecutiveFlag(false);
        return false;
      } else {
        setNonConsecutiveFlag(true);
        return true;
      }
    } catch (ex) {
      throw ex;
    }
  };

  const formatTooltipText = (checkedCheckbox, obj) => {
    try {
      var counter = 0;
      if (checkedCheckbox.length === 0) {
        counter = 1;
      } else {
        counter = checkedCheckbox.length;
      }
      var text;
      if (obj.status) {
        text =
          "<div class='tooltip-wrapper'><div class='image-container'></div><div class='counter-placeholder'>" +
          counter +
          '</div></div>';
      } else {
        text =
          "<div class='tooltip-wrapper'><div class='tooltip-text'>" +
          translateText.getTranslatedText(transObj, 'MESSAGE_INFO_REORDER') +
          '</div></div>';
      }
      return text;
    } catch (ex) {
      throw ex;
    }
  };

  const enableDragForSelectedScans = (_draggingGroup) => {
    try {
      if (uiCheckBoxArray.indexOf(_draggingGroup) !== -1) {
        for (var i = 0; i <= uiCheckBoxArray.length - 1; i++) {
          if (scanSetCol[uiCheckBoxArray[i]].hasOwnProperty('isDraggable')) {
            scanSetCol[uiCheckBoxArray[i]].isDraggable = true;
          }
        }
      }
    } catch (ex) {
      throw ex;
    }
  };

  const createNode = (node) => {
    try {
      if (node !== undefined) {
        var data = {
          type: node.type,
          uniqueId: node.uniqueId,
          name: node.name,
          executionItemList: node.executionItemList,
          outputDescriptionList: node.outputDescriptionList,
          dataType: node.dataType,
          editMode: node.editMode,
        };
        reOrderNodes.push(data);
      }
    } catch (ex) {
      throw ex;
    }
  };

  var updateReOrderResult = function () {
    try {
      selectedScanSetsCount = 0;
      reloadChooseAction({
        pasteItems: 'clearPaste',
        reloadScasets: 'yes',
        isContentEdited: true,
      });
      reOrderNodes = [];
      hideSpinner();
    } catch (ex) {
      let message = errorHandlingService.getErrorMessage(
        transObj,
        'MESSAGE_ERROR_GENERAL_RETRY_CONTACT_ADMIN',
        '',
        '10121'
      );
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: message,
      });
      setLoading(false);
    }
  };

  const scanListEvents = {
    onDragstart: function (sourceNodes, event) {
      try {
        singleSelectScanSetCollection = _.cloneDeep(scanSetCol);
        let checkedCheckbox = [];
        hideContextMenu();
        setIsDraggableFlag(true);
        let _draggingGroup = getGroupKey(sourceNodes);
        setDraggingGroup(_draggingGroup);
        setUiCheckBoxArray([]);
        //enable isDraggable

        if (scanSetCol[_draggingGroup].isDraggable) {
          checkedCheckbox = updateUIDraggableScans();
        }

        // scanSetcollectionKeys needed ad index is 0/1 only
        setScanSetcollectionKeys(Object.keys(scanSetCol));
        setDraggIndex([]);

        // ui selected scans index into an array
        for (var i = 0; i <= checkedCheckbox.length - 1; i++) {
          draggIndex.push(Object.keys(scanSetCol).indexOf(checkedCheckbox[i]));
        }

        // call to check consecutive scans or not
        let consecutiveFlag = checkConsecutive(checkedCheckbox);

        // if select all, disable tooltips
        if (selectedAll === true) {
          setShowToolTip(false);
          setIsDraggableFlag(false);
        } else {
          setShowToolTip(true);
          setIsDraggableFlag(true);
        }

        if (!consecutiveFlag) {
          //enable isDraggable for single selection and multi selection
          if (checkedCheckbox.length === 0) {
            if (scanSetCol[_draggingGroup].hasOwnProperty('isDraggable')) {
              selectedCheckBoxUpdation(null, 'unSelectAll');
              singleSelectScanSetCollection[_draggingGroup].isDraggable = true;
              singleSelectScanSetCollection[_draggingGroup].isSelected = true;
              draggIndex.push(Object.keys(scanSetCol).indexOf(_draggingGroup));
            }
            setTooltipText(
              formatTooltipText(checkedCheckbox, { status: true })
            );
            setShowToolTip(true);
          } else {
            setTooltipText(
              formatTooltipText(checkedCheckbox, { status: true })
            );
            enableDragForSelectedScans(_draggingGroup);
            setShowToolTip(true);
          }
        }

        //enable tooltip for non consecutive scan
        else if (consecutiveFlag) {
          setTooltipText(formatTooltipText(checkedCheckbox, { status: false }));
          setShowToolTip(true);
          var top = event.clientY + 10;
          var left = event.clientX + 10;
          if (!tooltipOndrag) {
            tooltipOndrag = document.getElementById('dndTooltip');
          }
          if (top <= 10 || left <= 10) {
            tooltipOndrag.style.display = 'none';
          } else {
            tooltipOndrag.style.top = top + 'px';
            tooltipOndrag.style.left = left + 'px';
            tooltipOndrag.style.display = 'block';
          }
        }

        //disable ghost image for drag
        if (event.dataTransfer && event.dataTransfer.setDragImage) {
          globalHelperService.preventDefaultDragImage(event);
        }

        setScanSetCollection(singleSelectScanSetCollection);
        onSelectedScansetCollectionList(singleSelectScanSetCollection);
      } catch (ex) {
        throw ex;
      }
    },

    onDragover: function (dropNodes, index, event) {
      try {
        event.stopPropagation();
        event.preventDefault();

        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
          var top = event.clientY + 10;
          var left = event.clientX + 10;
          if (!tooltipOndrag) {
            tooltipOndrag = document.getElementById('dndTooltip');
          }
          if (top <= 10 || left <= 10) {
            tooltipOndrag.style.display = 'none';
          } else {
            tooltipOndrag.style.top = top + 'px';
            tooltipOndrag.style.left = left + 'px';
            tooltipOndrag.style.display = 'block';
          }
        }

        let consecutiveFlag = checkConsecutive(uiCheckBoxArray);

        if (!consecutiveFlag) {
          let dragNodeIndex = 0;

          if (
            uiCheckBoxArray.length > 0 &&
            uiCheckBoxArray.length < Object.keys(scanSetCol).length
          ) {
            dragNodeIndex = uiCheckBoxArray[uiCheckBoxArray.length - 1];
            dragNodeIndex = parseInt(dragNodeIndex.split('_')[1]);
            dragNodeIndex = dragNodeIndex + 1;
          } else if (uiCheckBoxArray.length < Object.keys(scanSetCol).length) {
            dragNodeIndex = parseInt(draggingGroup.split('_')[1]);
            dragNodeIndex = dragNodeIndex + 1;
          }
          if (index !== 1 && dragNodeIndex > index) {
            let node = index - 2;
            dropNodes = scanSetCol['group_' + node].excecutionList;
          }

          var elem = document.querySelectorAll(
            '[Id^="draggableItemPlaceholder"]'
          );

          //add class hide to all the placeholder
          for (var i = 0; i < elem.length; i++) {
            elem[i].classList.add('hide');
          }

          if (dragNodeIndex && index && uiCheckBoxArray.length < 2) {
            if (dragNodeIndex > index) {
              event.currentTarget.firstElementChild.classList.remove('hide');
            } else if (dragNodeIndex < index) {
              event.currentTarget.lastElementChild.classList.remove('hide');
            }
          } else if (uiCheckBoxArray.length > 1 && dragNodeIndex && index) {
            let checkedArray = uiCheckBoxArray[0].split('_')[1];
            checkedArray = parseInt(checkedArray) + 1;

            if (
              index &&
              (dragNodeIndex === index || dragNodeIndex < index) &&
              scanSetCol[uiCheckBoxArray[uiCheckBoxArray.length - 1]]
                .viewOrder !== index
            ) {
              if (dragNodeIndex === index) {
                document
                  .getElementById('dragBody_' + (index + 1))
                  .lastElementChild.classList.remove('hide');
              } else {
                document
                  .getElementById('dragBody_' + index)
                  .lastElementChild.classList.remove('hide');
              }
            } else if (
              index &&
              (checkedArray - 1 > index || checkedArray - 1 === index)
            ) {
              document
                .getElementById('dragBody_' + index)
                .firstElementChild.classList.remove('hide');
            }
          }

          var dragNodes = Object.keys(dropNodes).map(function (nodeValues) {
            return dropNodes[nodeValues];
          });

          let _droppingGroup = dragNodes[0].parentKey;
          setDroppingGroup(_droppingGroup);

          // index should be considered from  dropNodes
          var droppingIndex = scanSetcollectionKeys.indexOf(_droppingGroup);
          var prevIndex =
            draggIndex[0] - 1 === 0 && index === 0
              ? droppingIndex
              : droppingIndex + 1;
          var nextIndex =
            draggIndex[draggIndex.length - 1] + 1 ===
              scanSetcollectionKeys.indexOf(_droppingGroup) && index === 1
              ? droppingIndex
              : droppingIndex - 1;
          var itemType = dragNodes[0].type;

          // check for undefined
          if (_droppingGroup !== undefined) {
            // check only for ExecutionSequence
            if (itemType === 'ExecutionSequence') {
              var groupedItem;
              if (
                scanSetCol[_droppingGroup].hasOwnProperty('isGroupedscan') &&
                scanSetCol[_droppingGroup].isGroupedscan === true
              ) {
                if (index === dragNodes.length) {
                  nextIndex = droppingIndex;
                }
                groupedItem = scanSetCol[_droppingGroup].isGroupedscan;
              } else {
                groupedItem = false;
              }
              //check if it is non consecutive
              if (nonConsecutiveFlag === false) {
                //check whether isDraggable is true
                if (
                  !(
                    draggIndex[0] <= prevIndex &&
                    draggIndex[draggIndex.length - 1] >= nextIndex
                  )
                ) {
                  // check for Grouped Item
                  if (groupedItem === false) {
                    return true;
                  } else {
                    // check for next and previous index and block Drop
                    if (
                      (index === dragNodes.length &&
                        index ===
                          scanSetCol[_droppingGroup].executionItemList
                            .length) ||
                      (index === 0 &&
                        dragNodes.length ===
                          scanSetCol[_droppingGroup].executionItemList.length &&
                        droppingIndex !== scanSetcollectionKeys.length - 1)
                    ) {
                      return true;
                    }
                  }
                }
              } else {
                return false;
              }
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } catch (ex) {
        throw ex;
      }
    },

    onDrop: function (targetNode, index) {
      try {
        if (
          draggingGroup !== droppingGroup &&
          !checkConsecutive(uiCheckBoxArray)
        ) {
          showSpinner();
          //true means source placed before the destination,
          //while false means source placed below the destination
          var afterTheNode = 'true';
          index = index - 1;
          if (index === 1 || index > 1) {
            afterTheNode = 'false';
            // reverse the array as we are adding last selected item to destination first
            uiCheckBoxArray.reverse();
          }
          var sourceNode = scanSetCol[draggingGroup];
          var destinationNode = scanSetCol[droppingGroup];
          createNode(destinationNode);
          // single selection with out check box
          if (uiCheckBoxArray.length === 0) {
            createNode(sourceNode);
          } else {
            //multiselection with check box
            for (var k = 0; k <= uiCheckBoxArray.length; k++) {
              createNode(scanSetCol[uiCheckBoxArray[k]]);
            }
          }
          setLoading(false);

          // for API post data format is [{sourcenNode},{destination}]
          // multi selection we send request one after the other
          var finalArray = [];
          for (var l = 1; l <= reOrderNodes.length - 1; l++) {
            var temp = [];
            temp.push(reOrderNodes[0]);
            temp.push(reOrderNodes[l]);
            temp.reverse();
            finalArray.push(temp);
          }
          var url =
            appSettings.MR_PATHS.PROTOCOL.SCAN_SET.SCANSET_REORDER +
            afterTheNode +
            '/' +
            currentData.examcardGuid +
            '/' +
            currentData.scannerId;
          callReorderApi(finalArray, updateReOrderResult, url);
        }
        return true;
      } catch (ex) {
        hideSpinner();
        let message = errorHandlingService.getErrorMessage(
          transObj,
          'MESSAGE_ERROR_GENERAL_RETRY_CONTACT_ADMIN',
          '',
          '10121'
        );
        onToggleError(true);
        onError({
          header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
          content: message,
        });

        setLoading(false);
      }
    },
    handleDrag: function (event) {
      event.stopPropagation();
      event.preventDefault();

      if (navigator.userAgent.toLowerCase().indexOf('firefox') <= -1) {
        var top = event.clientY + 10;
        var left = event.clientX + 10;
        if (!tooltipOndrag) {
          tooltipOndrag = document.getElementById('dndTooltip');
        }
        if (top <= 10 || left <= 10) {
          tooltipOndrag.style.display = 'none';
        } else {
          tooltipOndrag.style.top = top + 'px';
          tooltipOndrag.style.left = left + 'px';
          tooltipOndrag.style.display = 'block';
        }
      }
    },

    onDragEnd: function () {
      try {
        var elem = document.querySelectorAll(
          '[Id^="draggableItemPlaceholder"]'
        );

        //add class hide to all the placeholder
        for (var i = 0; i < elem.length; i++) {
          elem[i].classList.add('hide');
        }
        setIsDraggableFlag(false);
        setShowToolTip(false);
        setTooltipText('');
        return true;
      } catch (ex) {
        throw ex;
      }
    },

    openEditScan: function (event, scan) {
      try {
        event.preventDefault();
        event.stopPropagation();
        console.log(
          'scansetview-openEditScan-openEditScan function has been initialized'
        );
        var args = {
          uniqueId: scan.uniqueId,
          examcardGuid: currentData.examcardGuid,
          scannerId: currentData.scannerId,
          authorName: ecMetaInf.modifiedBy,
          updatedDate: ecMetaInf.modifiedOn,
          name: scan.name,
          lastUpdateName: scan.name,
        };
        console.log('scansetview-openEditScan-navigation to scan set page');
        let breadCrumbData = {
          clearAll: false,
          selectedRepoFromProtocolPage: selectedRepoFromProtocolPage,
          menu: {
            menu_0: {
              label: scan.name,
              id: 'M1211',
              stateData: args,
            },
          },
        };
        TriggerBreadCrumbChangeEvent(breadCrumbData);
      } catch (ex) {
        let message = errorHandlingService.getErrorMessage(
          transObj,
          'MESSAGE_ERROR_GENERAL_RETRY_CONTACT_ADMIN',
          '',
          '10122'
        );
        onToggleError(true);
        onError({
          header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
          content: message,
        });
      }
      console.log(
        'scansetview-openEditScan-openEditScan function execution ended'
      );
    },
  };

  const callReorderApi = (postData, callback, path) => {
    try {
      var reoderItems = protocolService.reOrder(
        path,
        postData[scanReOrderIndex]
      );
      reoderItems.then(
        function (response) {
          if (response.status === 200) {
            scanReOrderIndex++;
            if (scanReOrderIndex < postData.length) {
              callReorderApi(postData, callback, path);
            } else if (scanReOrderIndex === postData.length) {
              callback();
              scanReOrderIndex = 0;
            }
          } else {
            let errorInfo = errorHandlingService.checkForError(
              transObj,
              response
            );
            onToggleError(true);
            onError({
              header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
              content: errorInfo.message,
            });
            callback();
            scanReOrderIndex = 0;
          }
        },
        function (error) {
          onToggleError(true);
          onError({
            header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
            content: error.message,
          });
        }
      );
    } catch (ex) {
      throw ex;
    }
  };

  const updateResult = function (res) {
    if (res.deleteStatus === 'success') {
      reloadChooseAction({
        pasteItems: 'clearPaste',
        reloadScasets: 'yes',
        isContentEdited: true,
      });
    }
  };
  const deleteScanSet = function () {
    try {
      var path =
        appSettings.MR_PATHS.PROTOCOL.SCAN_SET.SCANSET_DELETE_URL +
        examcardGuid +
        '/' +
        scannerId;
      var multiSelectCollection = getSelectedScanSets();
      var deleteItemStatus = { failed: 0, success: 0, type: 'POST' };
      var nodesForDelete = [];
      for (var i = 0; i < multiSelectCollection.length; i++) {
        var data = {
          type: multiSelectCollection[i].type,
          uniqueId: multiSelectCollection[i].uniqueId,
          name: multiSelectCollection[i].name,
          executionItemList: multiSelectCollection[i].executionItemList,
          outputDescriptionList: [],
          dataType: multiSelectCollection[i].dataType,
          editMode: multiSelectCollection[i].editMode,
        };
        nodesForDelete.push(data);
      }
      processingDelete(
        { nodeData: nodesForDelete, scannerGroups: ecMetaInf.name },
        updateResult,
        path,
        deleteItemStatus
      );
    } catch (ex) {
      let message = errorHandlingService.getErrorMessage(
        transObj,
        'MESSAGE_ERROR_GENERAL_RETRY_CONTACT_ADMIN',
        '',
        '10076'
      );
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: message,
      });
    }
  };
  const processingDelete = function (
    deleteData,
    callback,
    path,
    deleteItemStatus
  ) {
    var newScope = {};
    newScope.progressStatus = 'beforeInitialization';
    newScope.deleteData = deleteData;
    newScope.percentage = 0;
    newScope.counter = 0;
    newScope.totalNodes = newScope.deleteData.nodeData.length;
    newScope.scannerNames = deleteData.scannerGroups;
    newScope.deleteNodeIndex = 0;
    newScope.progressContent = {
      action: translateText.getTranslatedText(transObj, 'LABEL_DELETING'),
      textWhileDeleting: translateText.getTranslatedText(
        transObj,
        'MESSAGE_INFO_DELETE_STATUS'
      ),
    };
    newScope.deleteItemStatus = deleteItemStatus;
    newScope.path = path;
    newScope.callback = callback;
    newScope.onDeleteInitializing = function () {
      newScope.progressStatus = 'initialized';
      deleteNodeIndex = 0;
      callDeleteApi(newScope, callback, path, deleteItemStatus);
    };
    newScope.onDeleteCancel = function () {
      newScope.deleteData.nodeData = [];
    };
    openDeleteWarningDialogue(newScope);
  };
  const openDeleteWarningDialogue = function (deleteScope) {
    onToggleConfirmDialogue(true);
    onConfirmWarning({
      header: translateText.getTranslatedText(transObj, 'LABEL_WARNING'),
      content: getDeleteWarningContent(deleteScope),
      onDelete: function () {
        deleteScope.progressStatus = 'initialized';
        onToggleConfirmDialogue(false);
        showProgressBar(
          translateText.getTranslatedText(transObj, 'LABEL_DELETING')
        );
        deleteScope.onDeleteInitializing();
      },
      onCancel: function () {
        deleteScope.deleteData.nodeData = [];
        onToggleConfirmDialogue(false);
      },
    });
  };
  const showProgressBar = (progressType) => {
    try {
      setPercentage(0);
      let progressContent = checkProgressContent(progressType);
      setProgressContent(progressContent['action']);
      setOpenPromptModal(true);
    } catch (ex) {
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: ex.message,
      });
    }
  };
  const closeProgressBar = () => {
    try {
      setTimeout(function () {
        setOpenPromptModal(false);
      });
    } catch (ex) {
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: ex.message,
      });
    }
  };
  const checkProgressContent = (progressType) => {
    return {
      action:
        progressType ===
        translateText.getTranslatedText(transObj, 'LABEL_DELETING')
          ? progressType
          : progressType +
            translateText.getTranslatedText(transObj, 'LABEL_PROGRESS'),
      textWhileDeleting: translateText.getTranslatedText(
        transObj,
        'LABEL_ADD_SCAN'
      ),
    };
  };
  const getDeleteWarningContent = function (deleteScope) {
    let content =
      '<p>' +
      translateText.getTranslatedText(transObj, 'MESSAGE_CONFIRMATION_DELETE');
    if (deleteScope.totalNodes === 1) {
      content =
        content +
        ' ' +
        deleteScope.totalNodes +
        ' ' +
        translateText.getTranslatedText(transObj, 'LABEL_ITEM');
    } else {
      content =
        content +
        ' ' +
        deleteScope.totalNodes +
        ' ' +
        translateText.getTranslatedText(transObj, 'LABEL_ITEMS');
    }
    content =
      content +
      "</p> <p class='word-break'>" +
      translateText.getTranslatedText(
        transObj,
        'MESSAGE_WARNING_AVAILABILITY'
      ) +
      ' ' +
      deleteScope.scannerNames +
      '</p> <p> ' +
      translateText.getTranslatedText(transObj, 'MESSAGE_CONFIRATION_PROCEED') +
      '</p>';
    return content;
  };
  const callDeleteApi = (newScope, callback, path, deleteItemStatus) => {
    newScope.deletedItems = ProtocolFolderViewService.deleteCall(
      path,
      newScope.deleteData.nodeData[deleteNodeIndex],
      deleteItemStatus.type
    );
    newScope.deletedItems.then(
      function (response) {
        if (response.status === 200) {
          ++deleteItemStatus.success;
          onProgressChecking(newScope, callback, path, deleteItemStatus);
        } else {
          ++deleteItemStatus.failed;
          deleteItemStatus.failedResponse = response;
          onProgressChecking(newScope, callback, path, deleteItemStatus);
        }
      },
      function (error) {
        ++deleteItemStatus.failed;
        deleteItemStatus.failedResponse = error;
        onProgressChecking(newScope, callback, path, deleteItemStatus);
      }
    );
  };
  const onProgressChecking = (newScope, callback, path, deleteItemStatus) => {
    try {
      newScope.counter = newScope.counter + 1;
      newScope.percentage = parseInt(
        (parseInt(newScope.counter, 10) / newScope.totalNodes) * 100,
        10
      );
      setPercentage(newScope.percentage);
      if (deleteItemStatus.failed > 0) {
        callback({
          deleteStatus: 'failure',
          failedResponse: deleteItemStatus.failedResponse,
        });
        closeProgressBar();
        return;
      } else if (newScope.percentage === 100) {
        callback({
          deleteStatus: 'success',
        });
        closeProgressBar();
        return;
      }
      if (deleteNodeIndex !== newScope.deleteData.nodeData.length - 1) {
        deleteNodeIndex++;
        callDeleteApi(newScope, callback, path, deleteItemStatus);
      }
    } catch (ex) {
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: ex.message,
      });
    }
  };
  const pasteScanSet = () => {
    try {
      if (sessionStorage.getItem('copiedScanSet_data')) {
        var copiedScanSets = JSON.parse(
          sessionStorage.getItem('copiedScanSet_data')
        );
        if (copiedScanSets instanceof Object) {
          var pasteScanSets = [];
          for (var i = 0; i < copiedScanSets.length; i++) {
            var data = {
              type: copiedScanSets[i].type,
              uniqueId: copiedScanSets[i].uniqueId,
            };
            pasteScanSets.push(data);
          }
          scanSetCollection = scanSetCol;
          var scanSets = scanSetCollection;
          var targetScanSetIndex = Object.keys(scanSets).length - 1;
          var targetScanSetkey = Object.keys(scanSets)[targetScanSetIndex];
          var targetScanSet = scanSets[targetScanSetkey];
          var targetScanSetList = {};
          targetScanSetList.type = targetScanSet.type;
          targetScanSetList.uniqueId = targetScanSet.uniqueId;
        }
      }
      let path =
        appSettings.MR_PATHS.PROTOCOL.SCAN_SET.SCANSET_COPY_PASTE +
        stateData.examcardGuid +
        '/' +
        stateData.scannerId;
      processingPasteRequest(
        { copiedData: pasteScanSets.reverse(), targetData: targetScanSetList },
        updateCopyPasteResult,
        path
      );
    } catch (ex) {
      let message = errorHandlingService.getErrorMessage(
        transObj,
        'MESSAGE_ERROR_GENERAL_RETRY_CONTACT_ADMIN',
        '',
        '10098'
      );
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: message,
      });
    }
  };

  const updateCopyPasteResult = (res) => {
    try {
      if (res.copyPasteStatus === 'success') {
        reloadChooseAction({
          pasteItems: 'retainPaste',
          reloadScasets: 'yes',
          isContentEdited: true,
        });
      }
    } catch (ex) {
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: ex.message,
      });
    }
  };
  const processingPasteRequest = (requestData, callback, path) => {
    try {
      var newScope = {};
      newScope.progressStatus = 'initialized';
      newScope.requestData = requestData;
      newScope.totalNodes = newScope.requestData.copiedData.length;
      newScope.percentage = 0;
      newScope.counter = 0;
      newScope.postData = [];
      newScope.progressContents = {
        action: translateText.getTranslatedText(transObj, 'LABEL_PASTE'),
        textWhileDeleting: translateText.getTranslatedText(
          transObj,
          'LABEL_ADD_SCAN'
        ),
      };
      setPercentage(0);
      showProgressBar(translateText.getTranslatedText(transObj, 'LABEL_PASTE'));
      copyPasteNodeIndex = 0;
      callCopyPasteApi(newScope, callback, path, copyPasteNodeIndex);
    } catch (err) {
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: err.message,
      });
      throw err;
    }
  };
  const callCopyPasteApi = (newScope, callback, path, copyPasteNodeIndex) => {
    try {
      newScope.postData = [];
      newScope.postData.push(
        newScope.requestData.copiedData[copyPasteNodeIndex]
      );
      newScope.postData.push(newScope.requestData.targetData);
      newScope.pasteItems = protocolService.copyPasteScanSet(
        path,
        newScope.postData
      );
      newScope.pasteItems.then(
        function (response) {
          if (response.status === 200) {
            newScope.counter = newScope.counter + 1;
            newScope.percentage = parseInt(
              (parseInt(newScope.counter, 10) / newScope.totalNodes) * 100,
              10
            );
            setPercentage(newScope.percentage);
            if (newScope.percentage === 100) {
              closeProgressBar();
              callback({
                copyPasteStatus: 'success',
              });
              return;
            }
            if (copyPasteNodeIndex !== newScope.totalNodes - 1) {
              copyPasteNodeIndex++;
              callCopyPasteApi(newScope, callback, path, copyPasteNodeIndex);
            }
          }
        },
        function (error) {
          closeProgressBar();
          onToggleError(true);
          onError({
            header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
            content: error.message,
          });
          callback({
            copyPasteStatus: 'success',
          });
        }
      );
    } catch (err) {
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: err.message,
      });
      throw err;
    }
  };

  const onClickSave = () => {
    onToggleSaveComment(true);
    setDisplayCommentOverlay(true);
  };

  const onSaveProtocol = (args, comments) => {
    try {
      onToggleSaveComment(false);
      setDisplayCommentOverlay(false);
      setLoading(false);
      showSpinner();
      let commentdata = {
        examcardGuid: examcardGuid,
        scannerGroupGuid: ecMetaInf.groupGUID,
        scannerId: scannerId,
        parentGuid: undefined,
        lastSavedTime: ecMetaInf.timestamp,
        systemComments: '',
        userComments: comments,
      };
      protocolService.saveProtocol(commentdata, (res) => {
        setOnSaveProtocolResponse(res);
        let errorInfo = errorHandlingService.checkForError(transObj, res);
        if (!errorInfo.status) {
          setLoading(true);
          setUpdateOption('onLoad');
          loadExamCardMetaDetails();
          reloadChooseAction({
            pasteItems: 'clearPaste',
            reloadScasets: 'yes',
            isContentEdited: false,
          });
          onToggleSuccess(true);
          onSuccess({
            header: translateText.getTranslatedText(
              transObj,
              'MESSAGE_INFO_SAVE_COMPLETE'
            ),
            content: translateText.getTranslatedText(
              transObj,
              'MESSAGE_INFO_PROTOCOL_SAVE_COMPLETE'
            ),
          });
        } else {
          hideSpinner();
          onToggleError(true);
          onError({
            header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
            content: errorInfo.message,
          });
        }
      });
    } catch (ex) {
      hideSpinner();
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: ex.message,
      });
    }
  };

  const toggleComment = () => {
    if (toggleSaveComment) {
      return (
        <SaveComment
          displayCommentOverlay={displayCommentOverlay}
          onSaveProtocol={onSaveProtocol}
        ></SaveComment>
      );
    }
  };

  const toggleSuccessDialogue = () => {
    if (toggleSuccess && successInfo) {
      return (
        <SuccessDialogueView
          data={{ header: successInfo.header, content: successInfo.content }}
        />
      );
    }
  };
  const getFirstSelectedScanSetObject = () => {
    scanSetCollection = scanSetCol;
    for (var key in scanSetCollection) {
      if (
        scanSetCollection.hasOwnProperty(key) &&
        scanSetCollection[key].hasOwnProperty('checkBoxSelected') &&
        scanSetCollection[key].checkBoxSelected
      ) {
        setRenameGroupKey(key);
        return scanSetCollection[key];
      } else if (
        scanSetCollection.hasOwnProperty(key) &&
        scanSetCollection[key].hasOwnProperty('isSelected') &&
        scanSetCollection[key].isSelected
      ) {
        setRenameGroupKey(key);
        return scanSetCollection[key];
      }
    }
  };
  const OnScanNameChange = (event, scanObject) => {
    try {
      let tempScanSetObj = _.cloneDeep(scanSetCol);
      let selectedScanSetToRename = renameInfo['renameScanSet'];
      tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self
      ].name = event.target.value;
      let regex = new RegExp(
        appSettings.MR_PATHS.PROTOCOL.SCAN_PROTOCOL_NAME_REG_EXP
      );
      if (
        tempScanSetObj[renameGroupKey].excecutionList[
          Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
        ].name.trim().length === 0
      ) {
        tempScanSetObj[renameGroupKey].excecutionList[
          Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
        ].errorMessage = translateText.getTranslatedText(
          transObj,
          'MESSAGE_INFO_NAME'
        );
      } else if (
        !regex.test(
          tempScanSetObj[renameGroupKey].excecutionList[
            Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
          ].name
        )
      ) {
        tempScanSetObj[renameGroupKey].excecutionList[
          Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
        ].errorMessage = translateText.getTranslatedText(
          transObj,
          'MESSAGE_INFO_VALID_CHARACTER'
        );
      } else if (
        tempScanSetObj[renameGroupKey].excecutionList[
          Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
        ].name
      ) {
        tempScanSetObj[renameGroupKey].excecutionList[
          Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
        ].errorMessage = '';
      }
      setScanSetCollection(tempScanSetObj);
      onSelectedScansetCollectionList(tempScanSetObj);
    } catch (ex) {
      throw ex;
    }
  };
  const OnGeoNameChange = (event, scanObject) => {
    try {
      let tempScanSetObj = _.cloneDeep(scanSetCol);
      let selectedScanSetToRename = renameInfo['renameScanSet'];
      tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self
      ].geometry = event.target.value;
      setScanSetCollection(tempScanSetObj);
      onSelectedScansetCollectionList(tempScanSetObj);
    } catch (ex) {
      throw ex;
    }
  };
  const OnGeometryLinkChange = (event, scanObject) => {
    try {
      let tempScanSetObj = _.cloneDeep(scanSetCol);
      let selectedScanSetToRename = renameInfo['renameScanSet'];
      tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self
      ].geometryLink = event.target.value;
      setScanSetCollection(tempScanSetObj);
      onSelectedScansetCollectionList(tempScanSetObj);
    } catch (ex) {
      throw ex;
    }
  };
  const OnRenameScanSetBlur = (event, scanObjs, type) => {
    try {
      let tempScanSetObj = _.cloneDeep(scanSetCol);
      let renameType = '';
      let selectedScanSetToRename = renameInfo['renameScanSet'];
      let lastUpdatedGeometryName =  
        tempScanSetObj[renameGroupKey].excecutionList[selectedScanSetToRename.self].lastUpdateGeometry;
      lastUpdatedGeometryName = lastUpdatedGeometryName?lastUpdatedGeometryName:'';
      let geometryName =  tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self].geometry;
      geometryName = geometryName?geometryName.trim():'';
      let geometryLink = tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self].geometryLink;
      geometryLink = geometryLink?geometryLink.trim():'';
      let lastUpdateGeometryLink = tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self].lastUpdateGeometryLink;
      lastUpdateGeometryLink = lastUpdateGeometryLink?lastUpdateGeometryLink.trim():'';
      if (editGeometryLink === type) {
        renameType = 'ChangeGeoLink';
        tempScanSetObj[renameGroupKey].excecutionList[
          selectedScanSetToRename.self
        ].geometryLink = event.target.value;
      } else if (editGeometry === type) {
        renameType = 'ChangeGeometry';
        tempScanSetObj[renameGroupKey].excecutionList[
          selectedScanSetToRename.self
        ].geometry = event.target.value;
      } else {
        renameType = 'RenameExecutionItem';
        tempScanSetObj[renameGroupKey].excecutionList[
          selectedScanSetToRename.self
        ].name = event.target.value;
      }
      tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self
      ].isEditMode = false;
      if (
        tempScanSetObj[renameGroupKey].excecutionList[
          Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
        ].errorMessage &&
        tempScanSetObj[renameGroupKey].excecutionList[
          Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
        ].errorMessage !== ''
      ) {
        tempScanSetObj[renameGroupKey].excecutionList[
          Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
        ].errorMessage = undefined;
        tempScanSetObj[renameGroupKey].excecutionList[
          selectedScanSetToRename.self
        ].name =
          tempScanSetObj[renameGroupKey].excecutionList[
            selectedScanSetToRename.self
          ].lastUpdateName;
      } else if (
        tempScanSetObj[renameGroupKey].excecutionList[
          selectedScanSetToRename.self
        ].name.trim() !==
          tempScanSetObj[renameGroupKey].excecutionList[
            selectedScanSetToRename.self
          ].lastUpdateName.trim() ||
          geometryName !== lastUpdatedGeometryName.trim() ||
          geometryLink !== lastUpdateGeometryLink) {
        showSpinner(true);
        scansetService.UpdateScanName(
          {
            examCardGUID: currentData.examcardGuid,
            systemID: currentData.scannerId,
            uniqueId:
              tempScanSetObj[renameGroupKey].excecutionList[
                selectedScanSetToRename.self
              ].uniqueId,
            name: tempScanSetObj[renameGroupKey].excecutionList[
              selectedScanSetToRename.self
            ].name.trim(),
            geometry:geometryName,
            geometryLink:geometryLink,
            renameType: renameType,
          },
          OnUpdateRenameResult.bind(
            tempScanSetObj[renameGroupKey].excecutionList[
              selectedScanSetToRename.self
            ]
          )
        );
      }
      setScanSetCollection(tempScanSetObj);
      onSelectedScansetCollectionList(tempScanSetObj);
      sessionStorage.setItem('isContentEdited', 'false');
    } catch (ex) {
      let message = errorHandlingService.getErrorMessage(
        transObj,
        'MESSAGE_ERROR_GENERAL_RETRY_CONTACT_ADMIN',
        '',
        '10087'
      );
      onToggleError(true);
      onError({
        header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
        content: message,
      });
    }
  };
  const OnUpdateRenameResult = (res) => {
    try {
      let tempScanSetObj = _.cloneDeep(scanSetCol);
      let selectedScanSetToRename = renameInfo['renameScanSet'];
      showSpinner(false);
      let errorInfo = errorHandlingService.checkForError(transObj, res);
      onEmitScan('RENAME_SCANSET', {});
      let lastUpdatedGeometryName =
        tempScanSetObj[renameGroupKey].excecutionList[selectedScanSetToRename.self].lastUpdateGeometry;
      lastUpdatedGeometryName = lastUpdatedGeometryName ? lastUpdatedGeometryName : '';
      let geometryName = tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self].geometry;
      geometryName = geometryName ? geometryName.trim() : '';
      let lastUpdateGeometryLink = tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self].lastUpdateGeometryLink;
      if (res.status === 500) {
        if (res.description === 'Changing Geometry is not allowed') {
          tempScanSetObj[renameGroupKey].excecutionList[
            selectedScanSetToRename.self
          ].geometry = lastUpdatedGeometryName?lastUpdatedGeometryName.trim():lastUpdatedGeometryName;
        } else if (res.description === 'Invalid value for Gemometry link') {
          tempScanSetObj[renameGroupKey].excecutionList[
            selectedScanSetToRename.self
          ].geometryLink =lastUpdateGeometryLink?lastUpdateGeometryLink.trim():"";
        } else {
          let lastUpdateGeometry =  tempScanSetObj[renameGroupKey].excecutionList[
            selectedScanSetToRename.self
          ].lastUpdateGeometry;
          lastUpdateGeometry = lastUpdateGeometry?lastUpdateGeometry.trim():lastUpdateGeometry;
          lastUpdateGeometryLink = lastUpdateGeometryLink?lastUpdateGeometryLink.trim():lastUpdateGeometryLink; 
          tempScanSetObj[renameGroupKey].excecutionList[
            selectedScanSetToRename.self
          ].geometry = lastUpdateGeometry;
;
          tempScanSetObj[renameGroupKey].excecutionList[
            selectedScanSetToRename.self
          ].geometryLink = lastUpdateGeometryLink;
        }
        reloadChooseAction({
          pasteItems: 'clearPaste',
          reloadScasets: 'No',
          isContentEdited: true,
        });
        selectedCheckBoxUpdation(
          null,
          tempScanSetObj[renameGroupKey].excecutionList[
            Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
          ]
        );
        setIsEdited(false);
        checkIsEdited(false);
        tempScanSetObj[renameGroupKey].excecutionList[
          selectedScanSetToRename.self
        ].isEditMode = false;
        setScanSetCollection(tempScanSetObj);
        onSelectedScansetCollectionList(tempScanSetObj);
        onToggleError(true);
        onError({
          header: translateText.getTranslatedText(transObj, 'LABEL_ERROR'),
          content: res.actions,
        });
        return;
      }
      if (!errorInfo.status) {
        tempScanSetObj[renameGroupKey].excecutionList[
          selectedScanSetToRename.self
        ].name =
          tempScanSetObj[renameGroupKey].excecutionList[
            selectedScanSetToRename.self
          ].lastUpdateName;
        return;
      } else {
        tempScanSetObj[renameGroupKey].excecutionList[
          selectedScanSetToRename.self
        ].lastUpdateName =
          tempScanSetObj[renameGroupKey].excecutionList[
            selectedScanSetToRename.self
          ].name.trim();
        tempScanSetObj[renameGroupKey].isSelected = false;
        reloadChooseAction({
          pasteItems: 'clearPaste',
          reloadScasets: 'No',
          isContentEdited: true,
        });
        selectedCheckBoxUpdation(
          null,
          tempScanSetObj[renameGroupKey].excecutionList[
            Object.keys(tempScanSetObj[renameGroupKey].excecutionList)[0]
          ]
        );
        setIsEdited(true);
        checkIsEdited(true);
      }
      tempScanSetObj[renameGroupKey].excecutionList[
        selectedScanSetToRename.self
      ].isEditMode = false;
      setScanSetCollection(tempScanSetObj);
    } catch (ex) {
      throw ex;
    }
  };

  return (
    <Fragment>
      {spinner}
      {toggleComment()}
      {toggleSuccessDialogue()}
      <section className='scan-set-section' data-testid='scanSetViewPage'>
        <ProtocolPromptBar
          open={isOpenPromptmodal}
          progressContents={progressContent}
          percentage={percentage}
        />
        <div
          id='dndTooltip'
          class='tooltip-container tooltip-ondrag tooltip-container-visible'
        >
          {showToolTip ? parse(tooltipText) : ''}
        </div>
        <div className={'scansetViewWrapper ' + (loading ? 'block' : 'hidden')}>
          <div className='row'>
            <div className='col-md-12'>
              <table className='full-height-width'>
                <tr>
                  <td>
                    <div className='scan-detail-view scan-set-detail-view'>
                      <div className='row'>
                        <div className='col-md-6'>
                          <input
                            type='text'
                            id='tooltipScanName'
                            className='title-edit-box ellipsis-text'
                            value={ecMetaInf.name}
                            readonly='readonly'
                          />
                        </div>
                        {ecMetaInf.name && ecMetaInf.name.length > 64 ? (
                          <MRTooltip
                            placement='bottom'
                            target='tooltipScanName'
                            type='info'
                            info={ecMetaInf.name}
                            modifiers={{
                              offset: {
                                offset: '0px,35px,-40px, 0',
                                enabled: true,
                              },
                            }}
                          ></MRTooltip>
                        ) : (
                          ''
                        )}
                        <div className='col-md-2 button-wrapper'>
                          <button
                            className='secondary-button full-width hide'
                            disabled
                          >
                            {translate('LABEL_SAVE_AS_NEW')}
                          </button>
                        </div>
                        <div className='col-md-2 button-wrapper'>
                          <button
                            className='secondary-button full-width hidden'
                            disabled
                          >
                            {translate('LABEL_UNDO_ALL')}
                          </button>
                        </div>
                        <div className='col-md-2 button-wrapper'>
                          <button
                            className='primary-button full-width'
                            disabled={
                              !isEdited ||
                              selectedRepoFromProtocolPage ===
                                appSettings.RESPOSITORY_TYPE.REFERENCE
                            }
                            data-testid='saveScanset'
                            onClick={onClickSave}
                          >
                            {translate('LABEL_SAVE')}
                          </button>
                        </div>
                      </div>
                      <div className='row'>
                        <div className='col-md-2'>
                          <div className='label-wrapper'>
                            <span>{translate('LABEL_TOTAL_TIME')}</span>
                          </div>
                          <div className='timer'>
                            <span className='timer-icon'>
                              <SVG src={clockIcon} alt='clock' />
                            </span>
                            <input
                              className='text-box full-width timer-input'
                              type='text'
                              value={ecMetaInf.time}
                              disabled
                            />
                          </div>
                        </div>
                        <div className='col-md-2'>
                          <div className='label-wrapper'>
                            <span> {ecMetaInf.groupLabel}</span>
                          </div>
                          <div>
                            <input
                              className='text-box full-width'
                              type='text'
                              value={ecMetaInf.systemType}
                              disabled
                            />
                          </div>
                        </div>
                        <div className='col-md-4'>
                          <div className='label-wrapper'>
                            <span>{translate('LABEL_PATHWAY')}</span>
                          </div>
                          <div>
                            <input
                              id='tooltipPathway'
                              className='text-box fluid-input ellipsis-text'
                              type='text'
                              value={ecMetaInf.pathway}
                              readonly='readonly'
                            />
                          </div>
                          {ecMetaInf.pathway &&
                          ecMetaInf.pathway.length > 64 ? (
                            <MRTooltip
                              placement='top'
                              target='tooltipPathway'
                              type='info'
                              info={ecMetaInf.pathway}
                              modifiers={{
                                offset: {
                                  offset: '0px,35px,-40px, 0',
                                  enabled: true,
                                },
                              }}
                            ></MRTooltip>
                          ) : (
                            ''
                          )}
                        </div>
                        <div className='col-md-2'>
                          <div className='label-wrapper'>
                            <span>{translate('LABEL_MODIFIED_ON')}</span>
                          </div>
                          <div>
                            <input
                              className='text-box full-width'
                              type='text'
                              value={ecMetaInf.modifiedOn}
                              disabled
                            />
                          </div>
                        </div>
                        <div className='col-md-2'>
                          <div className='label-wrapper'>
                            <span>{translate('LABEL_MODIFIED_BY')}</span>
                          </div>
                          <div>
                            <input
                              className='text-box full-width'
                              type='text'
                              disabled
                              value={ecMetaInf.modifiedBy}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* -- section for scan details -- */}

                <tr>
                  <td>
                    <div className='scan-list-details-section'>
                      <div className='row'>
                        <div
                          className={
                            'scans-list-wrapper' +
                            (istoggleSelection ? ' group-active' : '') +
                            (istoggleSelection ? ' col-xs-8' : ' col-md-8')
                          }
                        >
                          <div className='col-md-12 header'>
                            <div className='col-md-6 float-left label-section'>
                              {translate('LABEL_SCANS')}
                            </div>
                            <div className='col-md-6 float-right scanset-action-section'>
                              <ScanOptions
                                optionType={chooseActionOptionType}
                                ecMetaInfo={ecMetaInf}
                                copyScanSet={copyScanSet}
                                updateScanList={updateScanList}
                                getTargetScanSetID={getTargetScanSetID}
                                istoggleSelection={istoggleSelection}
                                deleteScanSet={deleteScanSet}
                                pasteScanSet={pasteScanSet}
                                enablePasteOption={enablePasteOption}
                                getFirstSelectedScanSetObject={
                                  getFirstSelectedScanSetObject
                                }
                              ></ScanOptions>
                            </div>
                            <div
                              className={
                                'scanset-arrow' +
                                (!istoggleSelection ? ' hide' : '')
                              }
                              onClick={toggleRightPanel}
                            >
                              <img
                                src={ToggleIconImageLeft}
                                alt='arrow'
                                className='toggle-icon-image'
                              />
                            </div>
                          </div>
                          <div className='col-md-12 scan-grid-section scan-scroll-item scrollbar'>
                            <table className='scan-grid-wrapper '>
                              <tr className='header'>
                                <td className='scan-select'>
                                  <input
                                    type='checkbox'
                                    id='allScanSet'
                                    className='checkboxEle'
                                    data-testid='selectAllScanSet'
                                    onClick={(e) => {
                                      setSelectedAll(!selectedAll);
                                      selectedCheckBoxUpdation(e, 'selectAll');
                                    }}
                                    checked={selectedAll}
                                  />
                                  <label for='allScanSet'>
                                    <span></span>
                                  </label>
                                </td>
                                <td className='scan-name'>
                                  {translate('LABEL_SCAN_NAME')}
                                </td>
                                <td className='scan-time'>
                                  {translate('LABEL_SCAN_TIME')}
                                  <span className='helper-text'>
                                    {translate('LABEL_MINUTE')}
                                  </span>
                                </td>
                                <td className='geometry'>
                                  {translate('LABEL_GEO_NAME')}
                                </td>
                                <td className='geometry-link'>
                                  {translate('LABEL_GEO_LINK')}
                                </td>
                                <td className='laterality'>
                                  {translate('LABEL_LATERALITY')}
                                </td>
                                <td className='accordion-col'></td>
                                <td className='contextual-menu-col'></td>
                              </tr>
                              <tr>
                                <td
                                  colspan='9'
                                  className='scan-group-wrapper'
                                  data-testid='scan-group-wrapper'
                                >
                                  <ScanList
                                    context='prodetail'
                                    nodeData={scanSetCol}
                                    key={scanSetCol.key}
                                    isDraggableFlag={isDraggableFlag}
                                    datascope={scanSetCol}
                                    singleSelection={singleSelection}
                                    scanevents={scanListEvents}
                                    selectedCheckBoxUpdation={
                                      selectedCheckBoxUpdation
                                    }
                                    OnScanNameChange={OnScanNameChange}
                                    OnRenameScanSetBlur={OnRenameScanSetBlur}
                                    getFirstSelectedScanSetObject={
                                      getFirstSelectedScanSetObject
                                    }
                                    OnGeoNameChange={OnGeoNameChange}
                                    OnGeometryLinkChange={OnGeometryLinkChange}
                                  ></ScanList>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </div>

                        <div
                          className={
                            'col-md-4 protocol-info-wrapper' +
                            (istoggleSelection ? ' hide' : '')
                          }
                        >
                          <div className='header'>
                            {translate('LABEL_PROTOCOL_INFO')}
                          </div>
                          <div
                            className='scanset-arrow right-arrow'
                            onClick={toggleRightPanel}
                          >
                            <img
                              src={ToggleIconImageRight}
                              alt='arrow'
                              className='toggle-icon-image'
                            />
                          </div>
                          <div className='row'>
                            <ProtocolInfo
                              type='protocol'
                              helpInfoStatus={helpInfoStatus}
                              helpInfoUrl={helpInfoUrl}
                              onRetryHelpInfo={onRetryHelpInfo}
                              helpLaunchUrl={helpLaunchUrl}
                            ></ProtocolInfo>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    {/* !-- version control section -- */}

                    <div className='row'>
                      <div className='col-md-12 version-control-section'>
                        <h5 className='header-section'>
                          {translate('LABEL_VERSION_CONTROL')}
                        </h5>
                        <div className='content-section'>
                          <div className='row'>
                            <div className='col-md-12'>
                              <table className='version-control-grid'>
                                <thead className='version-control-thead'>
                                  <tr className='version-control-tr'>
                                    <td className='modified-on'>
                                      {translate('LABEL_VERSION_NUMBER')}
                                    </td>
                                    <td className='modified-on'>
                                      {translate('LABEL_MODIFIED_ON')}
                                    </td>
                                    <td className='modified-by'>
                                      {translate('LABEL_MODIFIED_BY')}
                                    </td>
                                    <td className='comments'>
                                      {translate('LABEL_COMMENT')}
                                    </td>
                                  </tr>
                                </thead>
                                <tbody className='version-control-tbody'>
                                  {renderVersionInfo()}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    transObj: {
      selectedLanguage: state.i18n.locale,
      locale: state.i18n.translations,
    },
    stateData:
      state.mr_user.updateBreadCrumbArgs &&
      state.mr_user.updateBreadCrumbArgs.menu
        ? state.mr_user.updateBreadCrumbArgs.menu.menu_0.stateData
        : state.mr_user.updateBreadCrumbArgs,
    toggleSaveComment: state.mr_user.toggleSaveComment,
    toggleSuccess: state.mr_user.toggleSuccess,
    successInfo: state.mr_user.successInfo,
    renameInfo: state.mr_user.renameInfo,
    modality: state.mr_user.modality,
    selectedScansetCollection: state.mr_user.selectedScansetCollection,
    tabSelection: state.mr_user.tabSelection,
    selectedRepoFromProtocolPage:
      state.mr_user.updateBreadCrumbArgs &&
      state.mr_user.updateBreadCrumbArgs.selectedRepoFromProtocolPage
        ? state.mr_user.updateBreadCrumbArgs.selectedRepoFromProtocolPage
        : '',
  };
};
export default connect(mapStateToProps, {
  onToggleError,
  onError,
  checkIsEdited,
  TriggerBreadCrumbChangeEvent,
  onToggleConfirmDialogue,
  onConfirmWarning,
  onToggleSaveComment,
  onToggleSuccess,
  onSuccess,
  onEmitScan,
  onSelectedScansetCollectionList,
})(ScanSetView);
