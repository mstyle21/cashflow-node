import { mysqlCli } from ".";
import { BaseCategory } from "../entity/BaseCategory";
import { BASE_CATEGORIES } from "./data";

export const seedBaseCategory = () => {
  console.log("Seeding base categories...");

  const baseCategoryRepository = mysqlCli.getRepository(BaseCategory);

  const seed = async () => {
    for (const baseCategory of BASE_CATEGORIES) {
      let parentCategory = await baseCategoryRepository.findOneBy({
        name: baseCategory.name,
      });

      if (!parentCategory) {
        const newBaseCategory = new BaseCategory();

        newBaseCategory.name = baseCategory.name;
        newBaseCategory.keywords = baseCategory.keywords;

        parentCategory = await baseCategoryRepository.save(newBaseCategory);
      }

      for (const child of baseCategory.childs) {
        const childCategory = await baseCategoryRepository.findOneBy({ name: child.name });
        if (!childCategory) {
          const childBaseCategory = new BaseCategory();

          childBaseCategory.name = child.name;
          childBaseCategory.keywords = child.keywords;
          childBaseCategory.parent = parentCategory;

          await baseCategoryRepository.save(childBaseCategory);
        }
      }
    }
  };

  return new Promise((resolve, reject) => {
    seed()
      .then(() => {
        console.log("Base categories seeding completed!");
        resolve("OK");
      })
      .catch((e) => {
        console.error("Error seeding base categories: ", e);
        reject("error");
      });
  });
};
