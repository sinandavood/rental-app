export class Category{
    id:number=0;
    name:string="";
    iconImage:string="";
    description:string="";
    parentCategoryId?: number | null;
    parentCategory?: Category;
}