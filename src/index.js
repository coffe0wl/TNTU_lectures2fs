import { fetchTNTUPageDocument, getCourses, getLecture, getLecturesTreeByCourseHref } from "./fetch";
import { delay } from "./helper";
import fs from 'fs';
import pdf from 'html-pdf';
import { h1, h2, h3 } from './logger';


const rootDirName = 'Courses';
const folderCreator = async (folder, route) => {
  try {
      for(const key of Object.keys(folder)) {
      await delay(2000)
      if(typeof folder[key] === 'object'){
        const newFolderRoute = route + '/' + key;
        fs.mkdirSync(newFolderRoute);
        await folderCreator(folder[key], newFolderRoute);
      }else {
        const newFilePath = route + '/' + key;
        const documentHTML = await getLecture(folder[key]);
        fs.appendFile(newFilePath + '.html', documentHTML, () => {});
        pdf.create(documentHTML).toFile(newFilePath + '.pdf', () => {});
      }
    }
  } catch (error) {}
}

const script = async (id) => {
  const tree = {};

  h1('\n\Fetching courses:\n')
  const courses = await getCourses();
  h1('\n\Fetched ' + courses.length + 'courses\n');
  h1('\n\nFetching lectures:\n')
  for(let course of courses.filter(({ href }) => href.includes(id))) {
    await delay(2000);
    h2("\nFetching " + course.name);
    const lectures = await getLecturesTreeByCourseHref(course.href)
    if(lectures) tree[course.name] = lectures;
  }
  h1('\n\nFolders generator started:\n');
  if(!fs.existsSync(rootDirName)) fs.mkdirSync(rootDirName);
  await folderCreator(tree, rootDirName);
}
