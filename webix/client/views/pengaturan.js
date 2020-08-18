import {JetView} from "webix-jet";

export default class pengaturanView extends JetView{
	config(){
		return layout;
	}
	init(view){
		webix.$$("title").setHTML(`<div class='breadcrumb'><a class='n1'>${localStorage.getItem("mainTitle")} (${localStorage.getItem("mainDetails")})</a></div>`)
	}
}

const layout = {
	type: "space",
	rows:[{
		template:`pengaturan`
	}]
};
