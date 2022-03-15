import fetch from "node-fetch";
import { ATutorID } from './constants';
import { JSDOM } from 'jsdom';


const domain = 'https://dl.tntu.edu.ua/';
const coursesPageHref = 'users/index.php';

export const fetchTNTUPageDocument = async (href)  => {
  const path = href.includes(domain) ? href : domain + href;
  const response = await fetch(path, {
    method: 'GET',
	  headers: {
      accept: 'application/json',
      cookie: "ATutorID=" + ATutorID,
    },            
  });
  return response.text();
}

export const getCourses = async () => {
  let coursesPage = await fetchTNTUPageDocument(coursesPageHref);
  coursesPage =  new JSDOM(coursesPage).window.document;
  return Array.from(coursesPage.querySelectorAll(".ccard-course-title")).map((c) => ({ name: c.innerHTML.trim(), href: c.href }))
}


// utils
 const lecturesTableProcessor = (menuRows, skeleton = {}) => {
  for(let i = 0; i < menuRows.length; i++){
    if(menuRows[i].className.includes("menu_row")){
      if(menuRows[i+1] && menuRows[i+1].id.includes("folder")){
        let titleCurrNode = menuRows[i].querySelector("span>a>span") || menuRows[i].querySelector("span>.inlineEdits");
        if(!titleCurrNode) continue;
        const title = titleCurrNode.innerHTML.replace('&nbsp;', '').trim();
        skeleton[title] = {};
        lecturesTableProcessor(menuRows[i+1].children, skeleton[title]);
        i++;
      } else {
        const titleCurrNode = menuRows[i].querySelector("a");
        if(!titleCurrNode)continue;
        const title = titleCurrNode.title.trim();
        let href = menuRows[i].querySelector("a").href;
        skeleton[title] = href;
      }
    } 
  } 
  return skeleton;
}

export const getLecturesTreeByCourseHref = async (href) => {
  let coursePage = await fetchTNTUPageDocument(href);
  coursePage =  new JSDOM(coursePage).window.document;
  const table = coursePage.querySelector("div#menu_content_navigation>div>div#editable_table>div#folder0");
  if(!table) return null;
  const tableMenuRows = Array.from(table.children);
  return lecturesTableProcessor(tableMenuRows);
}

export const getLecture = (href) => {
  return fetchTNTUPageDocument(href + "&cframe=1");
}