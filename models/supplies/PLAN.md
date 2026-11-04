Each kind of Art Supply (marker, brush, pen, paper....) has certain CONSISTENT fields (Color, Quality, Favorite, Brand, Title, Quantity, Category....) which is different for each kind of Art Supply. Each field has props eg (IsOptional, Type (text/select/etc), DefaultValue, ... and when you start typing it should bring up previously used values or you can create a new one). Location, OnWishlist, OnHatelist, Quality 1-5, IsFavorite, Title is required for all, others can be optional (even Brand, some supplies aren't branded? Don't make it overly strict.)

Fields are like 5 static types I think
Text - any string value, has savedValues for searching and displaying while typing input
Number - any integer or float, has min/max
Color - any color #abcdef, in UI can use color picker
Select/Radio - a string with an array of allowed values / ENUM, isMultipleSelectAllowed bool, radio or select box
Image - unlikely to be used, but user could upload an image? Maybe an image of the item for recognition or demo of use but that would be a pain to use, might be good for pens/brushes/nibs specifically or colors but. should be optional

Field:
  Name: String
  Type: ["Text", "Number", "Color", "Select", "Image"]
  Min: Number?
  Max: Number?
  Options: String[]?
  PrevValues: String[]?
  Default: String || Number

Static Fields: Quality 1-5, List: [Love, Hate, Want, Neutral], Name, Category, Location
Dynamic Fields: Color, Width, Height, ColorCode, Brand, DemoImage, Pattern, ...


TextInput: Name: String, prevValues: String[]
NumberInput: Name: String, IntegerOnly? bool=true, Min: Number, Max: Number
Color: Name: String
Select: Name: String, Options: String[], isMultipleSelectAllowed=false
Image: Name: String



Field -
 ColorFamily: type: Text, savedValues: ["Red", "Orange", "Gray", "Tan", "Brown", ...], default: "Red"
 BrandColor: type: Text, savedValues: "H37", "Pearlescent Light Amethyst", default: null
 Quality: type: Number, min 1, max 5, savedValues: null, default: 4
 Brand: type: Text, savedValues: "Winsor & Newton", ...., default: null
 ...

Category - "String", existingValues: "..."
Location - "String", existingValues: "Closet, Desk gray shelf 1, "....

ArtSupply
 Name: "Marker"
 Category: Coloring (or Drawing, Inking, Papercrafts, Fabric Crafts...)
 ...other static fields...
 Fields: {
    "Color": required: true, default: "Black", BrandColor: required: false, Quality: required, Brand: ....
 }

Marker entry
 Title: default "<Brand> <Line> <Color> <Name> eg WN Pearlescent Acrylic Green Ink Marker
 ColorFmily: Green
 ColorBrand: Pearlescent Grass Green H37
 Brand: WN
 Line; Pearlescent Acrylic Ink
 Quality: 4


Default of ArtSupply overrides default of Field

Forms to - create new ArtSupply, create 1+ entries of a specific kind of ArtSuppply (bulk entries pls), new Field
Forms to - edit an entry of an art supply (should do in sort/filter page)s
Sort/Filter/Search form
Form to delete an entry, confirm button, etc
Must save each change, no bulk changes I don't wanna deal with it

Brand line category and location are fields, no need for a schema for them