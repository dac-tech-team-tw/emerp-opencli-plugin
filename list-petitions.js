import { cli, Strategy } from '@jackwener/opencli/registry';
import { CommandExecutionError, AuthRequiredError } from '@jackwener/opencli/errors';

const BASE_URL = 'http://10.0.250.60/eFormFlow';
const FORM_TEMPLATE_ID = 'b79bcf9f-79a2-41dd-83f1-d97e7354a067';
const FORM_CATEGORY_ID = '09ffed42-46c0-461d-9ca7-6b2a40af71db';
const ENTERPRISE_ID = 'a6acc0a7-13a2-4f6f-8be9-7452ae6564b8';

const STATUS_MAP = { '0': '草稿', '1': '待簽', '2': '已核准', '3': '已駁回', '4': '已撤簽' };
const STATUS_CODE = { '草稿': '0', '待簽': '1', '已核准': '2', '已駁回': '3', '已撤簽': '4' };

cli({
  site: 'emerp',
  name: 'list-petitions',
  domain: '10.0.250.60',
  description: '列出我的 EMERP 一般簽呈（預設顯示全部，可用 --status 過濾）',
  strategy: Strategy.PAGE_FETCH,
  browser: true,
  access: 'read',
  siteSession: 'persistent',
  args: [
    {
      name: 'status',
      type: 'string',
      positional: false,
      required: false,
      default: '',
      choices: ['', '草稿', '待簽', '已核准', '已駁回', '已撤簽'],
      help: '篩選狀態：草稿 / 待簽 / 已核准 / 已駁回 / 已撤簽',
    },
    {
      name: 'limit',
      type: 'int',
      positional: false,
      required: false,
      default: 20,
      help: '最多顯示筆數（預設 20）',
    },
  ],
  columns: ['serialNo', 'subject', 'status', 'amount', 'paymentMethod', 'createAt', 'formId'],
  func: async (page, kwargs) => {
    const statusLabel = kwargs.status ?? '';
    const limit = kwargs.limit ?? 20;
    const statusCode = statusLabel ? (STATUS_CODE[statusLabel] ?? '') : '';

    await page.goto(`${BASE_URL}/WFEM/WFEM2030/Index`);

    const params = new URLSearchParams({
      sort: '', page: '1', pageSize: String(limit),
      group: '', filter: '',
      SignStatus: '', Fm11001: '',
      Fm11002: FORM_TEMPLATE_ID,
      Fm11003: '', Fm11002One: FORM_TEMPLATE_ID,
      Fm01001: FORM_CATEGORY_ID,
      Fm02010: '', Fm11007: '',
      Fe20007: statusCode,
      Fm11006Start: '', Fm11006End: '',
      Fm11005Str: '', Fm11011Str: '',
      Fm11800: 'MERP', Fm11801: ENTERPRISE_ID,
      Fm11016: '', ChildFm11001: '',
      'FixCondition.fs01002': '', 'FixCondition.fs11001': '',
      'FixCondition.fm01001': '', 'FixCondition.fm02003': '',
      'FixCondition.flowStatus': '0',
      'FixCondition.isOnlySessionUser': 'false',
    });

    const result = await page.evaluate(async (body, baseUrl) => {
      try {
        const res = await fetch(`${baseUrl}/Wfem2030/QueryGetDatas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });
        if (res.status === 401 || res.status === 403) return { __error: 'auth' };
        if (!res.ok) return { __error: `http_${res.status}` };
        return await res.json();
      } catch (e) {
        return { __error: String(e.message || e) };
      }
    }, params.toString(), BASE_URL);

    if (result.__error === 'auth') {
      throw new AuthRequiredError('EMERP', `${BASE_URL}/Account/Login`);
    }
    if (result.__error) {
      throw new CommandExecutionError(`QueryGetDatas 失敗：${result.__error}`);
    }

    const rows = result.Data ?? [];

    return rows.map(row => {
      const fields = {};
      for (const fv of (row.FieldValues ?? [])) {
        if (fv.FM14005) fields[fv.FM14005] = fv.FM14004 ?? '';
      }

      const rawDate = row.FM11006 ?? '';
      const createAt = rawDate ? rawDate.replace('T', ' ').substring(0, 16) : '';
      const statusCode = String(row.FE20007 ?? '0');

      return {
        serialNo:      fields['F001'] ?? '',
        subject:       fields['F004'] ?? '',
        status:        STATUS_MAP[statusCode] ?? statusCode,
        amount:        fields['F024'] !== '' ? fields['F024'] : 0,
        paymentMethod: fields['F025'] ?? '',
        createAt,
        formId:        row.FM11001 ?? '',
      };
    });
  },
});
