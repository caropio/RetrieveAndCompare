import scholarly


def main():

    # Retrieve the author's data, fill-in, and print
    search_query = scholarly.search_pubs_query('By carrot or by stick')
    # print(search_query)
    # quit()
    author = next(search_query).fill()
    print(author)

    # Print the titles of the author's publications
    print([pub.bib['title'] for pub in author.publications])

    # Take a closer look at the first publication
    pub = author.publications[0].fill()
    print(pub)

    # Which papers cited that publication?
    print([citation.bib['title'] for citation in pub.get_citedby()])


if __name__ == '__main__':
    main()