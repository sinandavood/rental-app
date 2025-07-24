export class Category{
    id:number=0;
    name:string="";
    icon:string="";
    description:string="";
    parentCategoryId?: number | null;
    parentCategory?: Category;
}