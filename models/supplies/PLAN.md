Each kind of Art Supply (marker, brush, pen, paper....) has certain CONSISTENT fields (Color, Quality, Favorite, Brand, Title, Quantity, Category....) which is different for each kind of Art Supply. Each field has props eg (IsOptional, Type (text/select/etc), DefaultValue, ... and when you start typing it should bring up previously used values or you can create a new one). Location, OnWishlist, OnHatelist, Quality 1-5, IsFavorite, Title is required for all, others can be optional (even Brand, some supplies aren't branded? Don't make it overly strict.)

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
 Fields: {
    "Color": required: true, default: "Black", BrandColor: required: false, Quality: reqired, Brand: ....
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