# title, rating, calories, cholesterol, carbohydrates, fat, servings, ingredients
from  pattern.web import abs
from pattern.web import URL
from pattern.web import DOM
import os
import writer

from make_json import make_json


base = 'http://allrecipes.com/recipe'
end = 'detail.aspx'
dessert =  'http://allrecipes.com/recipes/desserts/ViewAll.aspx'
breakfast = 'http://allrecipes.com/recipes/breakfast-and-brunch/ViewAll.aspx'
main = 'http://allrecipes.com/recipes/main-dish/ViewAll.aspx'

# set npages to 2 for debugging purposes
def get_info(baseurl, out_filename, npages=200):

    output = open(out_filename, 'w')
    w = writer.UnicodeWriter(output)
    # TODO: fix this header
    w.writerow(['Title', 'Rating', 'Calories (kcal)', 'Cholesterol (mg)', 
        'Fat (g)', 'Protein (g)', 'Fiber (g)', 'Sodium (mg)', 'Cook Time', 
        'Ingredients', 'Full Ingredients'])

    for page in range(1, npages):
        try:
            url = URL(baseurl + '?Page=%d' % page)
            dom = DOM(url.download(cached=True)) 
            links = dom.by_class('rectitlediv')

            # goes through the 20 recipes on a given page
            for index in range(len(links)):
                #print index
                # get the link name
                title = links[index].content.split('/recipe/')[1].split('/detail')[0]
                # download individual recipe
                rpage = URL(os.path.join(base, title, end)) 
                pdom = DOM(rpage.download(cached=True))

                # average rating value
                rating = pdom.by_attribute(itemprop='ratingValue')[0].source.\
                        split('"')[3]

                # list of nutrition elements
                nut_list = pdom.by_class('nutrSumWrap')[0].by_class('nutrSumList')
                nut_vals = []
                for i in range(len(nut_list)):
                    val = nut_list[i].by_attribute(id='lblNutrientValue')[0].content
                    nut_vals.append(val)
                nuts = '\t'.join(nut_vals)

                # time needed to cook
                try: 
                    cook_hours = pdom.by_attribute(id='cookHoursSpan')[0].content
                    cook_hours = cook_hours.replace('<em>', ' ').replace('</em>', ' ')
                except:
                    cook_hours = '0'
                try:
                    cook_mins = pdom.by_attribute(id='cookMinsSpan')[0].content
                    cook_mins = cook_mins.replace('<em>', ' ').replace('</em>', ' ')
                except:
                    cook_mins = '0'
                mins = str(int(cook_hours.split()[0]) * 60 + \
                        int(cook_mins.split()[0]))

                # ingredients
                
                ## gets the block containing both the amount and the amount
                all_ings = pdom.by_attribute(itemprop='ingredients')
                ing_units = []
                ing_vals = []
                for ing_index in range(len(all_ings)):
                    tmp_ing = all_ings[ing_index].by_id('lblIngName').content
                    if '&nbsp;' in all_ings[ing_index].content:
                        continue
                    try: 
                        tmp_amount = all_ings[ing_index].by_id('lblIngAmount').content
                    except:
                        tmp_amount = '' # LET THIS BE THE EMPTY CHAR we decide on
                    ing_units.append(tmp_amount)
                    ing_vals.append(tmp_ing)
                ings = ';'.join(ing_vals)

                ing_units = [x + '|' for x in ing_units]
                str_ings = [str(x) for x in zip(ing_units, ing_vals)]
                str_ings = [x.replace(',', ' ') for x in str_ings]
                full_ings = ';'.join(str_ings)
                full_ings = full_ings.replace("u'", "").replace("'", "").replace(', u', '').\
                        replace('(', '').replace(')', '').replace('  ', ' ')

                assert len(ing_vals) == len(ing_units)

                w.writerow([title, rating, nuts, mins, ings, full_ings])

        except:
            pass

    output.close()


def get_cuisine(base, out, npages=200):

    data = '../data'

    raw = out + '.tsv'
    json = out + '.json'

    # scrape the data
    get_info(base, os.path.join(data, raw), npages)
    # convert into json form
    make_json(os.path.join(data, raw), os.path.join(data, json))

