import React, { Component } from "react";
import { getMovies } from "../services/fakeMovieService.js";
import { getGenres } from "../services/fakeGenreService";
import ListGroup from "./common/listGroup";
import MoviesTable from "./moviesTable";
import Pagination from "./common/pagination";
import SearchBox from "./searchBox";
import { paginate } from "../utils/paginate";
import _ from "lodash";
import { Link } from "react-router-dom";

class Movies extends Component {
  state = {
    movies: [],
    genres: [],
    currentPage: 1,
    pageSize: 4,
    sortColumn: { path: "title", order: "asc" },
    selectedGenre: null,
    searchQuery: "",
  };

  componentDidMount() {
    const genres = [{ _id: "", name: "All Genres" }, ...getGenres()];
    this.setState({ movies: getMovies(), genres: genres });
  }

  handleDelete = (movie) => {
    const movies = this.state.movies.filter((c) => c._id !== movie._id);
    this.setState({ movies });
  };

  handleLike = (movie) => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index] = { ...movies[index] };
    movies[index].liked = !movies[index].liked;
    this.setState({ movies });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleGenreSelect = (genre) => {
    this.setState({ selectedGenre: genre, searchQuery: "", currentPage: 1 });
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query, selectedGenre: null, currentPage: 1 });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  getPagedData = () => {
    const {
      movies: allMovies,
      currentPage,
      pageSize,
      sortColumn,
      selectedGenre,
      searchQuery,
    } = this.state;

    let filtered = allMovies;
    if (searchQuery)
      filtered = allMovies.filter((m) =>
        m.title.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else if (selectedGenre && selectedGenre._id)
      filtered = allMovies.filter((m) => m.genre._id === selectedGenre._id);

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const movies = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, data: movies };
  };

  render() {
    const { length: count } = this.state.movies;
    const {
      genres,
      currentPage,
      pageSize,
      sortColumn,
      selectedGenre,
      searchQuery,
    } = this.state;

    if (count === 0) return "There are no movies in the database.";

    // apply filtering, sorting, pagination
    const { totalCount, data: movies } = this.getPagedData();

    return (
      <div className="row">
        <div className="col-2">
          <ListGroup
            genres={genres}
            onItemSelect={this.handleGenreSelect}
            selectedItem={selectedGenre}
          />
        </div>
        <div className="col">
          <Link
            to="movies/new"
            style={{ marginBottom: 20 }}
            className="btn btn-primary"
          >
            New Movie Form
          </Link>

          <h2>Showing {movies.length} movies in the database.</h2>
          <SearchBox value={searchQuery} onChange={this.handleSearch} />
          <MoviesTable
            movies={movies}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            onLike={this.handleLike}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default Movies;
