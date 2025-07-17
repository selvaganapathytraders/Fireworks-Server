import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  actualPrice!: number;

  @Prop({ default: 0, min: 0, max: 100 })
  discount!: number;

  @Prop({ required: true })
  productDescription!: string;

  @Prop({ required: true })
  productType!: string;

  // Remove these as we're storing in MongoDB
  // @Prop()
  // image: string;

  // @Prop()
  // imagePath: string;

  // Image storage in MongoDB
  @Prop({ type: Buffer })
  imageData!: Buffer;

  @Prop()
  imageType!: string;

  @Prop()
  imageName!: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('discountedPrice').get(function() {
  return this.actualPrice - (this.actualPrice * this.discount / 100);
});

// Add virtual for image URL
ProductSchema.virtual('imageUrl').get(function() {
  return this.imageData ? `/products/${this._id}/image` : null;
});

// Add virtual for hasImage
ProductSchema.virtual('hasImage').get(function() {
  return !!this.imageData;
});

// Include virtuals when converting to JSON and exclude sensitive data
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret: any) {
    delete ret.imageData; // No TS error now
    return ret;
  }
});
