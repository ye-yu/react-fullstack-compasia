import { NoArgConstructor } from '../../common/types/no-arg-constructor.type';
import { Repository } from 'typeorm';
import { SeederType } from './seeder.type';
import { ColorEntity } from '../entities/color.entity';
import { faker } from '@faker-js/faker';
import { BrandEntity } from '../entities/brand.entity';
import { CategoryEntity } from '../entities/category.entity';
import { ProductEntity } from '../entities/product.entity';

function select<T>(arr: T[], min = 1, max = arr.length): T[] {
  const shallowCopied = [...arr].sort(() => Math.random() - 0.5);
  const range = max - min + 1;
  const rangeRandom = Math.floor(Math.random() * range);
  return shallowCopied.slice(0, min + rangeRandom);
}

function selectOne<T>(arr: T[]): T {
  const shallowCopied = [...arr].sort(() => Math.random() - 0.5);
  return shallowCopied[0];
}

export const InitialSeed: SeederType = {
  seed: async function (
    repoGetter: <T>(entity: NoArgConstructor<T>) => Repository<T>,
  ): Promise<void> {
    // available colors
    const availableColors = [
      'Red',
      'Green',
      'Blue',
      'White',
      'Grey',
      'Teal',
      'Sea Blue',
      'Rose Gold',
      'Skin',
    ];
    const productColorRepo = repoGetter(ColorEntity);
    const colorsInsertResult = await productColorRepo
      .createQueryBuilder()
      .insert()
      .into(ColorEntity)
      .values(
        availableColors.map((e) => ({
          name: e,
        })),
      )
      .returning(['id', 'name'])
      .execute();

    const colors = colorsInsertResult.generatedMaps as ColorEntity[];

    const availableCategories = [
      'Phone',
      'Tablet',
      'Laptop',
      'Personal Computer',
      'Chromebook',
      'Foldable Phone',
    ];
    const CategoriesRepo = repoGetter(CategoryEntity);
    const categoriesInsertResult = await CategoriesRepo.createQueryBuilder()
      .insert()
      .into(CategoryEntity)
      .values(
        availableCategories.map((e) => ({
          name: e,
        })),
      )
      .returning(['id', 'name'])
      .execute();

    const categories = categoriesInsertResult.generatedMaps as CategoryEntity[];

    const availableBrands = Array.from({ length: 30 }).map(() =>
      faker.company.name(),
    );
    const brandsRepo = repoGetter(BrandEntity);
    const productsRepo = repoGetter(ProductEntity);
    // make 10 products for each brand
    for (const brand of availableBrands) {
      const productPrefix = Math.random()
        .toString(26)
        .slice(2, 8)
        .toUpperCase();

      const brandColor = Math.random().toString(16).substring(2, 8);
      const products = Array.from({ length: 10 }).map((_, index) => {
        const indexString = `${index}`.padStart(4, '0');
        const selectedColors = select(colors, 2, 4);
        const selectedCategory = selectOne(categories);
        const fakedName = faker.commerce.productName();
        const name = `${fakedName} ${selectedCategory.name}`;
        const nameSpacedByPlus = name.split(' ').join('+');
        const product: Omit<
          ProductEntity,
          'id' | 'brand' | 'brandId' | 'categoryId' | 'colorId'
        > = {
          productStringId: `${productPrefix}${indexString}`,
          priceMYR: 500 + Math.ceil(Math.random() * 3000),
          name,
          photos: [
            `https://dummyimage.com/600x400/${brandColor}/333.png&text=${nameSpacedByPlus}`,
          ],
          stockCount: 1,
          colors: selectedColors,
          category: selectedCategory,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return product as ProductEntity;
      });

      const brandEntity: Omit<BrandEntity, 'id' | 'categories'> = {
        name: brand,
        createdAt: new Date(),
        updatedAt: new Date(),
        products,
      };

      await brandsRepo.save(brandEntity);
      await productsRepo.save(
        brandEntity.products.map((e) => ({ ...e, brand: brandEntity })),
      );
    }

    return;
  },
};
