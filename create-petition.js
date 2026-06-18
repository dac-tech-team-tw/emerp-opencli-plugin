import { cli, Strategy } from '@jackwener/opencli/registry';
import { ArgumentError, CommandExecutionError, AuthRequiredError } from '@jackwener/opencli/errors';

const FORM_TEMPLATE_ID = 'b79bcf9f-79a2-41dd-83f1-d97e7354a067';
const BASE_URL = 'http://10.0.250.60/eFormFlow';

// Field UUIDs defined by the form template (stable unless admin redesigns the form)
const FIELD_IDS = {
  serialNo:      'b952b0b9-fa50-479c-9cc1-142452a83e6e',
  applicant:     '25815493-5bde-43f0-a52d-b0ac7a35272c',
  department:    '6d9e435a-2c04-45ca-92f2-8d0c5ac1ad2b',
  subject:       '417b0770-2e8e-4858-a7b7-4d979570d9f3',
  description:   '976ceb23-f5d8-451a-981d-034b06728333',
  exampleLink:   '4bb87c26-f7bb-4dc0-9852-5990b8995f44',
  feeHeader:     'fb259f9b-3020-47ca-bbbc-84c3246c57a9',
  unknown275:    '275c3905-966e-4757-a25d-c68ce2ab668d',
  amount:        '7d3e9679-3650-41dd-930c-6e9162625b21',
  paymentMethod: 'e0d579aa-d8af-430a-88bd-3f6b76adc1b7',
  paymentNote:   '823cb7f2-645f-433b-95e7-5f2fd9555b0b',
};

const PAYMENT_OPTIONS = ['員工代墊', '暫借', '月結30天', '其他'];

cli({
  site: 'emerp',
  name: 'create-petition',
  domain: '10.0.250.60',
  description: '在 EMERP 建立一般簽呈草稿（預設只儲存，加 --submit 送簽）',
  strategy: Strategy.PAGE_FETCH,
  browser: true,
  access: 'write',
  siteSession: 'persistent',
  args: [
    {
      name: 'subject',
      type: 'string',
      positional: true,
      required: true,
      help: '簽呈主旨',
    },
    {
      name: 'description',
      type: 'string',
      positional: true,
      required: true,
      help: '說明內容',
    },
    {
      name: 'amount',
      type: 'int',
      positional: false,
      required: false,
      default: 0,
      help: '預估金額（元），無費用可不填',
    },
    {
      name: 'payment-method',
      type: 'string',
      positional: false,
      required: false,
      default: '',
      choices: ['', ...PAYMENT_OPTIONS],
      help: '支付方式：員工代墊 / 暫借 / 月結30天 / 其他',
    },
    {
      name: 'payment-note',
      type: 'string',
      positional: false,
      required: false,
      default: '',
      help: '支付方式或條件補充說明',
    },
    {
      name: 'submit',
      type: 'boolean',
      positional: false,
      required: false,
      default: false,
      help: '送簽（預設只儲存草稿，加此 flag 才會送出簽核流程）',
    },
  ],
  columns: ['formId', 'subject', 'status', 'url'],
  func: async (page, kwargs) => {
    const subject = kwargs.subject;
    const description = kwargs.description;
    const amount = kwargs.amount ?? 0;
    const paymentMethod = kwargs['payment-method'] ?? '';
    const paymentNote = kwargs['payment-note'] ?? '';
    const doSubmit = kwargs.submit ?? false;

    if (!subject || subject.trim() === '') {
      throw new ArgumentError('subject', '主旨不可為空');
    }
    if (!description || description.trim() === '') {
      throw new ArgumentError('description', '說明不可為空');
    }
    if (paymentMethod && !PAYMENT_OPTIONS.includes(paymentMethod)) {
      throw new ArgumentError('payment-method', `支付方式必須是：${PAYMENT_OPTIONS.join(' / ')}`);
    }

    // Navigate to the form page to establish session context
    await page.goto(`${BASE_URL}/WFEM/WFEM2030/Index`);

    // Step 1: GetForm to get pre-filled user/dept UUIDs
    const getFormResult = await page.evaluate(async (templateId, baseUrl) => {
      try {
        const res = await fetch(`${baseUrl}/Wfem2030/GetForm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Fm02001: templateId }),
        });
        if (res.status === 401 || res.status === 403) return { __error: 'auth' };
        if (!res.ok) return { __error: `http_${res.status}` };
        return await res.json();
      } catch (e) {
        return { __error: String(e.message || e) };
      }
    }, FORM_TEMPLATE_ID, BASE_URL);

    if (getFormResult.__error === 'auth') {
      throw new AuthRequiredError('EMERP', `${BASE_URL}/Account/Login`);
    }
    if (getFormResult.__error) {
      throw new CommandExecutionError(`GetForm 失敗：${getFormResult.__error}`);
    }

    // Extract pre-filled values
    const prefilled = {};
    for (const f of (getFormResult.FilledForm?.Fields ?? [])) {
      if (f.Fm14003) prefilled[f.Fm14003] = f;
    }

    const applicantUUID = prefilled[FIELD_IDS.applicant]?.Fm14004 ?? '';
    const deptUUID = prefilled[FIELD_IDS.department]?.Fm14004 ?? '';

    // Step 2: Build SaveForm payload
    const masterTemplate = Object.fromEntries([
      'Fm11002','Fm11003','Fm11004','Fm11005','Fm11006','Fm11007',
      'Fm11008','Fm11009','Fm11010','Fm11011','Fm11012','Fm11013',
      'Fm11014','Fm11015','Fm11017','Fm11800','Fm11801',
      'CreatorId','EditorId','CreateAt','EditAt',
      'Fs11003','Fm02004','Fm02013','Fm02014',
      'Errors','DeltaType','DbRowver','Rowver','formTitle',
    ].map(k => [k, '']));
    Object.assign(masterTemplate, {
      enabledDispaly: true, enabledNew: false, enabledEdit: false, enabledNewEdit: false,
      hideDisplay: true, hideNew: false, hideEdit: false, hideNewEdit: false,
    });

    const fields = [
      { Fm14003: FIELD_IDS.serialNo },
      { Fm14003: FIELD_IDS.applicant,     Fm14004: applicantUUID },
      { Fm14003: FIELD_IDS.department,    Fm14004: deptUUID },
      { Fm14003: FIELD_IDS.subject,       Fm14004: subject },
      { Fm14003: FIELD_IDS.description,   Fm14004: description },
      { Fm14003: FIELD_IDS.exampleLink },
      { Fm14003: FIELD_IDS.feeHeader },
      { Fm14003: FIELD_IDS.unknown275 },
      { Fm14003: FIELD_IDS.amount,        Fm14004: amount },
      { Fm14003: FIELD_IDS.paymentMethod, Fm14004: paymentMethod, Fm14008: '', Fm14009: '' },
      { Fm14003: FIELD_IDS.paymentNote,   Fm14004: paymentNote },
    ];

    const payload = {
      Fm02001: FORM_TEMPLATE_ID,
      Master: masterTemplate,
      Fields: fields,
    };

    // Step 3: Save draft (--submit stores draft then prompts manual submit; auto-submit API not yet found)
    const endpoint = 'SaveForm';
    const saveResult = await page.evaluate(async (ep, body, baseUrl) => {
      try {
        const res = await fetch(`${baseUrl}/Wfem2030/${ep}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.status === 401 || res.status === 403) return { __error: 'auth' };
        if (!res.ok) return { __error: `http_${res.status}` };
        return await res.json();
      } catch (e) {
        return { __error: String(e.message || e) };
      }
    }, endpoint, payload, BASE_URL);

    if (saveResult.__error === 'auth') {
      throw new AuthRequiredError('EMERP', `${BASE_URL}/Account/Login`);
    }
    if (saveResult.__error) {
      throw new CommandExecutionError(`${endpoint} 失敗：${saveResult.__error}`);
    }

    const formId = saveResult.Data;
    if (!formId) {
      throw new CommandExecutionError(`${endpoint} 未回傳表單 ID，回應：${JSON.stringify(saveResult)}`);
    }

    return {
      formId,
      subject,
      status: doSubmit ? '草稿已儲存（請到 WFEM2030 手動送簽）' : '草稿已儲存',
      url: `${BASE_URL}/WFEM/WFEM2030/Index`,
    };
  },
});
