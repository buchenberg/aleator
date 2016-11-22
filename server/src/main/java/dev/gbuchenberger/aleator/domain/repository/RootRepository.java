package dev.gbuchenberger.aleator.domain.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import dev.gbuchenberger.aleator.domain.nlp.Root;


public interface RootRepository extends CrudRepository<Root, Long> {
	
	List<Root> findByHjid(Long Hjid);

}
