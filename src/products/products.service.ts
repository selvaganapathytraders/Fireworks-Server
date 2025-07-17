import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File): Promise<Product> {
    const productData: any = {
      ...createProductDto,
    };

    if (file) {
      // Validate file size (additional check)
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('File size too large. Maximum 5MB allowed.');
      }
      
      productData.imageData = file.buffer;
      productData.imageType = file.mimetype;
      productData.imageName = file.originalname;
    }

    const createdProduct = new this.productModel(productData);
    return createdProduct.save();
  }

  async findAll(): Promise<Product[]> {
    // Exclude imageData from the response for performance
    return this.productModel.find().select('-imageData').exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).select('-imageData').exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findOneWithImage(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File): Promise<Product> {
    const existingProduct = await this.findOneWithImage(id);

    const updateData: any = { ...updateProductDto };

    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('File size too large. Maximum 5MB allowed.');
      }
      
      updateData.imageData = file.buffer;
      updateData.imageType = file.mimetype;
      updateData.imageName = file.originalname;
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-imageData')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<Product> {
    const product = await this.findOne(id);

    const deletedProduct = await this.productModel.findByIdAndDelete(id).select('-imageData').exec();

    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return deletedProduct;
  }

  async findByType(productType: string): Promise<Product[]> {
    return this.productModel.find({ productType }).select('-imageData').exec();
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.productModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { productDescription: { $regex: query, $options: 'i' } },
          { productType: { $regex: query, $options: 'i' } },
        ],
      })
      .select('-imageData')
      .exec();
  }
}