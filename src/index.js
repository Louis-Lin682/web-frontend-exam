/* eslint-disable */
import { Factory, Model, Server } from 'miragejs';
import ReactDOM from 'react-dom/client';
import App from './App';
import educationList from './constants/educationList';
import jobList from './constants/jobList';
import salaryList from './constants/salaryList';

// 搜尋比對時忽略所有空白與英文字母大小寫。
const normalizeSearchText = (value) => String(value || '')
  .replace(/\s+/g, '')
  .toLowerCase();

const filterFormat = (data, companyName, educationLevel, salaryLevel) => {
  let result = data;

  if (companyName) {
    const keyword = normalizeSearchText(companyName);
    result = result.filter((item) => (
      normalizeSearchText(item.companyName).includes(keyword)
    ));
  }
  if (educationLevel) {
    result = result.filter((item) => item.educationId === educationLevel);
  }
  if (salaryLevel) {
    result = result.filter((item) => item.salaryId === salaryLevel);
  }

  return result;
};

new Server({
  models: {
    jobList: Model,
    educationList: Model,
    salaryList: Model,
  },
  factories: {
    jobList: Factory.extend({
      companyName(i) {
        return jobList[i].companyName;
      },
      jobTitle(i) {
        return jobList[i].jobTitle;
      },
      educationId(i) {
        return jobList[i].educationId;
      },
      salaryId(i) {
        return jobList[i].salaryId;
      },
      preview(i) {
        return jobList[i].preview;
      },
      companyPhoto(i) {
        return jobList[i].companyPhoto;
      },
      description(i) {
        return jobList[i].description;
      },
    }),
    educationList: Factory.extend({
      id(i) {
        return educationList[i].id;
      },
      label(i) {
        return educationList[i].label;
      },
    }),
    salaryList: Factory.extend({
      id(i) {
        return salaryList[i].id;
      },
      label(i) {
        return salaryList[i].label;
      },
    }),
  },
  seeds(server) {
    server.createList('jobList', jobList.length);
    server.createList('educationList', educationList.length);
    server.createList('salaryList', salaryList.length);
  },
  routes() {
    this.namespace = 'api/v1';

    this.get('/jobs', (schema, request) => {
      // * filter
      const companyName = request.queryParams.company_name;
      const educationLevel = Number(request.queryParams.education_level);
      const salaryLevel = Number(request.queryParams.salary_level);

      // * pagination
      const prePage = Number(request.queryParams.pre_page);
      const page = Number(request.queryParams.page);

      const data = schema.jobLists
        .all()
        .models.map(
          ({ attrs: { companyPhoto, description, ...rest } }) => rest,
        );

      if (!isNaN(prePage) && !isNaN(page)) {
        const startIndex = (page - 1) * prePage;
        const endIndex = startIndex + prePage;
        const filterData = filterFormat(
          data,
          companyName,
          educationLevel,
          salaryLevel,
        );
        const resultData = filterData.slice(startIndex, endIndex);
        return {
          data: resultData,
          total: filterData.length,
        };
      }
      const result = filterFormat(
        data,
        companyName,
        educationLevel,
        salaryLevel,
      );
      return {
        data: result,
        total: result.length,
      };
    });

    this.get('/educationLevelList', (schema) =>
      schema.educationLists.all().models.map((item) => item.attrs),
    );

    this.get('/salaryLevelList', (schema) =>
      schema.salaryLists.all().models.map((item) => item.attrs),
    );

    this.get('/jobs/:id', (schema, request) => {
      const { id } = request.params;
      const data = schema.jobLists.all().models.find((item) => item.id === id);

      if (data) {
        const { preview, educationId, salaryId, ...rest } = data.attrs;
        return rest;
      }
      return [];
    });
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
