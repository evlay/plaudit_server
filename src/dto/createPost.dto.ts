import { IsString, IsDateString, IsNumber } from "class-validator";
import "reflect-metadata";

class CreatePostDto {
  @IsString()
  // @ts-ignore: disable strict class initialization
  body: string;

  @IsNumber({}, {each:true})
  // @ts-ignore: disable strict class initialization
  upvotes: string[];

  @IsString()
  // @ts-ignore: disable strict class initialization
  username: string;

  @IsDateString()
  // @ts-ignore: disable strict class initialization
  createdOn: date;
}

export default CreatePostDto;
