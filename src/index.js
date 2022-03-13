import { fetchTNTUPageDocument, getCourses, getLecture, getLecturesTreeByCourseHref } from "./fetch";
import { delay } from "./helper";
import settings from './settings';
import dataTree from './mock/tree.json';
import fs from 'fs';
import pdf from 'html-pdf';


const rootDirName = 'Courses';
const folderCreator = async (folder, route) => {
  await Promise.all(Object.keys(folder).map(async (key) => {
    await delay(3000);
    if(typeof folder[key] === 'object'){
      const newFolderRoute = route + '/' + key;
      fs.mkdirSync(newFolderRoute);
      folderCreator(folder[key], newFolderRoute);
    }else {
      const newFilePath = route + '/' + key;
      const documentHTML = await getLecture(folder[key]);
      fs.appendFile(newFilePath + '.html', documentHTML, () => {});
      pdf.create(documentHTML).toFile(newFilePath + '.pdf', () => {});
    }
  }))
}

const script = async () => {
  const tree = {};

  const courses = await getCourses();
  await Promise.all(courses.map( async (course) => {
    const lectures = await getLecturesTreeByCourseHref(course.href)
    if(lectures) tree[course.name] = lectures;
    await delay(1000);
  }))

  await delay(5000);
  fs.mkdirSync(rootDirName);
  await folderCreator(tree, rootDirName);

}

script();